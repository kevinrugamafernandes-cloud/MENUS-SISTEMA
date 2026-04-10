// TablesTab — Fase 4: gestión de mesas con crear y activar/desactivar

import { useState, useEffect, useCallback } from "react";
import { AdminTable }          from "../../types";
import { fetchAdminTables, createAdminTable, setTableActive } from "../../services/api.service";
import { LoadingSpinner }      from "../shared/LoadingSpinner";
import { useToast }            from "../../hooks/useToast";
import { ToastContainer }      from "../shared/Toast";

export function TablesTab() {
  const [tables,  setTables]  = useState<AdminTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const toast = useToast();

  // Formulario nueva mesa
  const [showForm,    setShowForm]    = useState(false);
  const [newNumber,   setNewNumber]   = useState("");
  const [newQr,       setNewQr]       = useState("");
  const [creating,    setCreating]    = useState(false);
  const [formError,   setFormError]   = useState<string | null>(null);

  // Toggle en curso
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchAdminTables();
      setTables(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar mesas");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    const num = parseInt(newNumber);
    if (isNaN(num) || num <= 0) return setFormError("El número de mesa debe ser positivo");

    setCreating(true); setFormError(null);
    try {
      const res = await createAdminTable({
        number: num,
        qrCode: newQr.trim() || undefined,
      });
      toast.success(`Mesa ${res.data.number} creada correctamente`);
      setNewNumber(""); setNewQr(""); setShowForm(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al crear mesa");
    } finally { setCreating(false); }
  }

  async function handleToggle(table: AdminTable) {
    const confirmMsg = table.active
      ? `¿Desactivar la Mesa ${table.number}? El cliente no podrá hacer pedidos desde esta mesa.`
      : `¿Activar la Mesa ${table.number}?`;
    if (!window.confirm(confirmMsg)) return;

    setTogglingId(table.id);
    try {
      await setTableActive(table.id, !table.active);
      toast.success(`Mesa ${table.number} ${!table.active ? "activada" : "desactivada"}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cambiar estado");
    } finally { setTogglingId(null); }
  }

  const activas   = tables.filter((t) => t.active);
  const inactivas = tables.filter((t) => !t.active);

  if (loading) return <LoadingSpinner message="Cargando mesas..." />;

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Mesas</h2>
          <p className="text-sm text-gray-500">
            {activas.length} activas · {inactivas.length} inactivas
          </p>
        </div>
        <button onClick={() => { setShowForm(true); setFormError(null); }}
                className="btn-primary text-sm py-2.5 px-5">
          + Nueva mesa
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error} <button onClick={load} className="underline ml-2">Reintentar</button>
        </div>
      )}

      {/* Modal nueva mesa */}
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowForm(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl
                          shadow-2xl p-6 max-w-sm mx-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Nueva mesa</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de mesa *
                </label>
                <input
                  type="number" min="1"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="Ej: 6"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código QR <span className="text-gray-400 font-normal">(se genera automáticamente si está vacío)</span>
                </label>
                <input
                  type="text"
                  value={newQr}
                  onChange={(e) => setNewQr(e.target.value)}
                  placeholder="Ej: QR-MESA-006"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                             focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
              {formError && (
                <p className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-sm">
                  {formError}
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-secondary flex-1 text-sm">
                Cancelar
              </button>
              <button onClick={handleCreate} disabled={creating} className="btn-primary flex-1 text-sm">
                {creating ? "Creando..." : "Crear mesa"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Grid de mesas */}
      {tables.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <p className="text-4xl mb-3">🪑</p>
          <p className="text-gray-500 text-sm">No hay mesas registradas aún</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {tables.map((table) => {
            const hasActiveOrder = (table.orders?.length ?? 0) > 0;
            return (
              <div
                key={table.id}
                className={`bg-white rounded-2xl border p-4 shadow-sm flex flex-col gap-3
                            transition-opacity ${!table.active ? "opacity-50" : ""}
                            ${hasActiveOrder ? "border-brand-300 ring-1 ring-brand-200" : "border-gray-100"}`}
              >
                {/* Número */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{table.number}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Mesa</p>
                  </div>
                  {hasActiveOrder && (
                    <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5
                                     rounded-full font-semibold">
                      Activa
                    </span>
                  )}
                </div>

                {/* QR code */}
                <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                  <p className="text-xs text-gray-500 font-mono truncate">{table.qrCode}</p>
                </div>

                {/* URL del menú */}
                <a
                  href={`/menu/mesa/${table.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-600 hover:underline"
                >
                  Ver menú →
                </a>

                {/* Toggle */}
                <button
                  onClick={() => handleToggle(table)}
                  disabled={togglingId === table.id}
                  className={`w-full text-xs py-1.5 rounded-lg font-semibold transition-colors
                              disabled:opacity-40
                              ${table.active
                                ? "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                                : "bg-green-50 text-green-700 hover:bg-green-100"}`}
                >
                  {togglingId === table.id ? "..." : table.active ? "Desactivar" : "Activar"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}