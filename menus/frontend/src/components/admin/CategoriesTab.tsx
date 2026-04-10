// CategoriesTab — Fase 4: toast de feedback, validación mejorada

import { useState, useEffect, useCallback } from "react";
import { Category }           from "../../types";
import { fetchAdminCategories, createAdminCategory, updateAdminCategory } from "../../services/api.service";
import { LoadingSpinner }     from "../shared/LoadingSpinner";
import { useToast }           from "../../hooks/useToast";
import { ToastContainer }     from "../shared/Toast";

export function CategoriesTab() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const [newName,     setNewName]     = useState("");
  const [creating,    setCreating]    = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName,  setEditName]  = useState("");
  const [saving,    setSaving]    = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchAdminCategories();
      setCategories(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar categorías");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return setCreateError("El nombre es requerido");
    if (name.length > 60) return setCreateError("Máximo 60 caracteres");

    setCreating(true); setCreateError(null);
    try {
      const res = await createAdminCategory(name);
      toast.success(`Categoría "${res.data.name}" creada`);
      setNewName("");
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al crear";
      setCreateError(msg);
      toast.error(msg);
    } finally { setCreating(false); }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id); setEditName(cat.name); setEditError(null);
  }
  function cancelEdit() { setEditingId(null); setEditName(""); setEditError(null); }

  async function handleSaveEdit(id: number, originalName: string) {
    const name = editName.trim();
    if (!name) return setEditError("El nombre no puede estar vacío");
    if (name === originalName) { cancelEdit(); return; }
    if (name.length > 60) return setEditError("Máximo 60 caracteres");

    setSaving(true); setEditError(null);
    try {
      await updateAdminCategory(id, name);
      toast.success(`Categoría actualizada a "${name}"`);
      setEditingId(null);
      await load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al actualizar";
      setEditError(msg);
      toast.error(msg);
    } finally { setSaving(false); }
  }

  if (loading) return <LoadingSpinner message="Cargando categorías..." />;

  return (
    <div className="space-y-4 max-w-lg">
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

      <div>
        <h2 className="text-lg font-bold text-gray-900">Categorías</h2>
        <p className="text-sm text-gray-500">{categories.length} registradas</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error} <button onClick={load} className="underline ml-2">Reintentar</button>
        </div>
      )}

      {/* Nueva categoría */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Nueva categoría</h3>
        <div className="flex gap-2">
          <input type="text" value={newName}
                 onChange={(e) => { setNewName(e.target.value); setCreateError(null); }}
                 onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                 placeholder="Ej: Entradas"
                 maxLength={60}
                 className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                            focus:outline-none focus:ring-2 focus:ring-brand-400" />
          <button onClick={handleCreate} disabled={creating || !newName.trim()}
                  className="btn-primary text-sm py-2.5 px-4 disabled:opacity-40">
            {creating ? "..." : "Crear"}
          </button>
        </div>
        {createError && <p className="text-red-500 text-xs mt-2">{createError}</p>}
        <p className="text-xs text-gray-400 mt-2">{newName.length}/60 caracteres</p>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-3xl mb-2">🗂️</p>
            <p className="text-gray-400 text-sm">Sin categorías aún</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <li key={cat.id} className="px-5 py-3.5 flex items-center gap-3">
                {editingId === cat.id ? (
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex gap-2">
                      <input type="text" value={editName}
                             onChange={(e) => { setEditName(e.target.value); setEditError(null); }}
                             onKeyDown={(e) => {
                               if (e.key === "Enter")  handleSaveEdit(cat.id, cat.name);
                               if (e.key === "Escape") cancelEdit();
                             }}
                             autoFocus maxLength={60}
                             className="flex-1 border border-brand-400 rounded-xl px-3 py-2 text-sm
                                        focus:outline-none focus:ring-2 focus:ring-brand-400" />
                      <button onClick={() => handleSaveEdit(cat.id, cat.name)} disabled={saving}
                              className="bg-brand-600 text-white text-xs font-semibold px-3 py-2
                                         rounded-xl hover:bg-brand-700 disabled:opacity-40">
                        {saving ? "..." : "Guardar"}
                      </button>
                      <button onClick={cancelEdit}
                              className="text-gray-400 hover:text-gray-600 text-xs px-2">
                        Cancelar
                      </button>
                    </div>
                    {editError && <p className="text-red-500 text-xs">{editError}</p>}
                  </div>
                ) : (
                  <>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                      {cat._count !== undefined && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {cat._count.products} producto{cat._count.products !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                    <button onClick={() => startEdit(cat)}
                            className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                      Editar
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}