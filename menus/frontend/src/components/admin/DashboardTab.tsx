// DashboardTab — Fase 4: dashboard del día real con métricas expandidas

import { useState, useEffect, useCallback } from "react";
import { DashboardSummary }      from "../../types";
import { fetchDashboardSummary } from "../../services/api.service";
import { LoadingSpinner }        from "../shared/LoadingSpinner";

function MetricCard({ label, value, sub, color = "text-gray-900", icon }: {
  label: string; value: string | number; sub?: string; color?: string; icon?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      {icon && <span className="text-2xl mb-2 block">{icon}</span>}
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-gray-700 mb-3">{children}</h3>;
}

function formatCurrency(n: number) { return `$${n.toFixed(2)}`; }
function formatTime(s: string) {
  return new Date(s).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

export function DashboardTab() {
  const [data,    setData]    = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchDashboardSummary();
      setData(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSpinner message="Cargando resumen del día..." />;

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
      {error} <button onClick={load} className="underline ml-2">Reintentar</button>
    </div>
  );

  if (!data) return null;
  const { dia, ahora, catalogo, topProductos, topCategorias, ultimasCobradas } = data;

  return (
    <div className="space-y-6">

      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Resumen del día</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date(dia.fecha).toLocaleDateString("es-ES", {
              weekday: "long", day: "numeric", month: "long",
            })}
          </p>
        </div>
        <button onClick={load}
                className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200
                           rounded-lg px-3 py-1.5 transition-colors">
          ↻ Actualizar
        </button>
      </div>

      {/* Métricas principales del día */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon="💰" label="Ventas del día"
          value={formatCurrency(dia.ventasTotales)} color="text-green-600"
          sub={`${dia.ordenesCobradas} cobradas`} />
        <MetricCard icon="🧾" label="Ticket promedio"
          value={formatCurrency(dia.ticketPromedio)} color="text-brand-600" />
        <MetricCard icon="📋" label="Órdenes totales"
          value={dia.totalOrdenes} sub="desde inicio del día" />
        <MetricCard icon="🪑" label="Mesas ocupadas"
          value={ahora.mesasOcupadas}
          sub={`${ahora.ordenesActivas} órdenes activas`} />
      </div>

      {/* Estado actual + Catálogo */}
      <div className="grid md:grid-cols-2 gap-4">

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <SectionTitle>Estado de órdenes hoy</SectionTitle>
          {[
            { label: "Pendientes",     count: dia.ordenesPorEstado.pendientes, dot: "bg-yellow-400" },
            { label: "En preparación", count: dia.ordenesPorEstado.preparando, dot: "bg-blue-400"   },
            { label: "Listas",         count: dia.ordenesPorEstado.listas,     dot: "bg-green-400"  },
            { label: "Cobradas",       count: dia.ordenesPorEstado.cobradas,   dot: "bg-gray-300"   },
          ].map(({ label, count, dot }) => (
            <div key={label} className="flex items-center justify-between py-2
                                        border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${dot}`} />
                <span className="text-sm text-gray-700">{label}</span>
              </div>
              <span className="text-sm font-bold text-gray-900">{count}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <SectionTitle>Catálogo</SectionTitle>
          {[
            { label: "Productos activos",  value: catalogo.productosActivos },
            { label: "Productos inactivos",value: catalogo.productosInactivos },
            { label: "Categorías",         value: catalogo.totalCategorias },
            { label: "Mesas activas",      value: `${catalogo.mesasActivas} / ${catalogo.totalMesas}` },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-600">{label}</span>
              <span className="text-sm font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top productos + Top categorías */}
      <div className="grid md:grid-cols-2 gap-4">

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <SectionTitle>Productos más pedidos hoy</SectionTitle>
          {topProductos.length === 0
            ? <p className="text-sm text-gray-400 text-center py-6">Sin datos aún</p>
            : topProductos.map((p, i) => (
              <div key={p.productId}
                   className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                  <div>
                    <p className="text-sm text-gray-800">{p.nombre}</p>
                    <p className="text-xs text-gray-400">{formatCurrency(p.ingresos)}</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-brand-600">×{p.cantidadPedida}</span>
              </div>
            ))
          }
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <SectionTitle>Categorías más vendidas hoy</SectionTitle>
          {topCategorias.length === 0
            ? <p className="text-sm text-gray-400 text-center py-6">Sin datos aún</p>
            : topCategorias.map((c, i) => (
              <div key={c.nombre}
                   className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                  <span className="text-sm text-gray-800">{c.nombre}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(c.ingresos)}</p>
                  <p className="text-xs text-gray-400">×{c.cantidad}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Últimas cobradas */}
      {ultimasCobradas.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <SectionTitle>Últimas 5 cobradas</SectionTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-gray-400 font-medium text-xs">Orden</th>
                  <th className="text-left pb-2 text-gray-400 font-medium text-xs">Mesa</th>
                  <th className="text-left pb-2 text-gray-400 font-medium text-xs">Hora</th>
                  <th className="text-right pb-2 text-gray-400 font-medium text-xs">Total</th>
                </tr>
              </thead>
              <tbody>
                {ultimasCobradas.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 font-medium text-gray-900">#{o.id}</td>
                    <td className="py-2.5 text-gray-600">Mesa {o.mesa}</td>
                    <td className="py-2.5 text-gray-500">{formatTime(o.cobradaEn)}</td>
                    <td className="py-2.5 text-right font-bold text-gray-900">
                      {formatCurrency(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}