// ProductsTab — Fase 4: añade toast de éxito/error y confirmación de toggle

import { useState, useEffect, useCallback } from "react";
import { AdminProduct, Category }   from "../../types";
import {
  fetchAdminProducts, fetchAdminCategories,
  createAdminProduct, updateAdminProduct, setProductAvailability,
} from "../../services/api.service";
import { LoadingSpinner } from "../shared/LoadingSpinner";
import { useToast }       from "../../hooks/useToast";
import { ToastContainer } from "../shared/Toast";

interface ProductForm {
  name: string; description: string; price: string;
  imageUrl: string; available: boolean; categoryId: number;
}
const EMPTY_FORM: ProductForm = {
  name: "", description: "", price: "", imageUrl: "", available: true, categoryId: 0,
};

function ProductFormModal({
  form, categories, editingId, saving, error, onChange, onSubmit, onClose,
}: {
  form: ProductForm; categories: Category[]; editingId: number | null;
  saving: boolean; error: string | null;
  onChange: (f: keyof ProductForm, v: string | boolean | number) => void;
  onSubmit: () => void; onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl
                      shadow-2xl p-6 max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            {editingId ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input type="text" value={form.name}
                   onChange={(e) => onChange("name", e.target.value)}
                   placeholder="Ej: Hamburguesa Clásica"
                   className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                              focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea value={form.description} rows={2}
                      onChange={(e) => onChange("description", e.target.value)}
                      placeholder="Descripción breve"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" step="0.01" min="0" value={form.price}
                       onChange={(e) => onChange("price", e.target.value)} placeholder="0.00"
                       className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm
                                  focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select value={form.categoryId}
                      onChange={(e) => onChange("categoryId", Number(e.target.value))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
                <option value={0} disabled>Seleccionar...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de imagen <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input type="url" value={form.imageUrl}
                   onChange={(e) => onChange("imageUrl", e.target.value)}
                   placeholder="https://..."
                   className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                              focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div onClick={() => onChange("available", !form.available)}
                 className={`w-10 h-6 rounded-full transition-colors relative
                             ${form.available ? "bg-brand-600" : "bg-gray-300"}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform
                                ${form.available ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            <span className="text-sm text-gray-700 font-medium">Disponible en el menú</span>
          </label>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5
                            rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancelar</button>
          <button onClick={onSubmit} disabled={saving} className="btn-primary flex-1 text-sm">
            {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </div>
    </>
  );
}

export function ProductsTab() {
  const [products,   setProducts]   = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  const [showModal,  setShowModal]  = useState(false);
  const [editingId,  setEditingId]  = useState<number | null>(null);
  const [form,       setForm]       = useState<ProductForm>(EMPTY_FORM);
  const [formError,  setFormError]  = useState<string | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Filtros
  const [filterCat,   setFilterCat]   = useState<number | "all">("all");
  const [filterAvail, setFilterAvail] = useState<"all" | "yes" | "no">("all");
  const [search,      setSearch]      = useState("");

  const toast = useToast();

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [pRes, cRes] = await Promise.all([fetchAdminProducts(), fetchAdminCategories()]);
      setProducts(pRes.data);
      setCategories(cRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter((p) => {
    if (filterCat  !== "all" && p.categoryId !== filterCat) return false;
    if (filterAvail === "yes" && !p.available)              return false;
    if (filterAvail === "no"  &&  p.available)              return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function openCreate() {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? 0 });
    setFormError(null); setShowModal(true);
  }
  function openEdit(p: AdminProduct) {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description ?? "", price: String(p.price),
              imageUrl: p.imageUrl ?? "", available: p.available, categoryId: p.categoryId });
    setFormError(null); setShowModal(true);
  }
  function handleFormChange(field: keyof ProductForm, value: string | boolean | number) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim())                                          return setFormError("El nombre es requerido");
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      return setFormError("El precio debe ser un número positivo");
    if (!form.categoryId)                                           return setFormError("Selecciona una categoría");

    setSaving(true); setFormError(null);
    const payload = {
      name:        form.name.trim(),
      description: form.description.trim() || undefined,
      price:       Number(form.price),
      imageUrl:    form.imageUrl.trim()    || undefined,
      available:   form.available,
      categoryId:  Number(form.categoryId),
    };
    try {
      if (editingId) {
        await updateAdminProduct(editingId, payload);
        toast.success("Producto actualizado correctamente");
      } else {
        await createAdminProduct(payload as Parameters<typeof createAdminProduct>[0]);
        toast.success("Producto creado correctamente");
      }
      setShowModal(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error al guardar");
    } finally { setSaving(false); }
  }

  async function handleToggle(p: AdminProduct) {
    const msg = p.available
      ? `¿Desactivar "${p.name}"? No aparecerá en el menú del cliente.`
      : `¿Activar "${p.name}"? Aparecerá en el menú del cliente.`;
    if (!window.confirm(msg)) return;

    setTogglingId(p.id);
    try {
      await setProductAvailability(p.id, !p.available);
      toast.success(`"${p.name}" ${!p.available ? "activado" : "desactivado"}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cambiar disponibilidad");
    } finally { setTogglingId(null); }
  }

  if (loading) return <LoadingSpinner message="Cargando productos..." />;

  return (
    <div className="space-y-4">
      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismiss} />

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Productos</h2>
          <p className="text-sm text-gray-500">
            {products.length} registrados · {products.filter((p) => p.available).length} disponibles
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary text-sm py-2.5 px-5 self-start sm:self-auto">
          + Nuevo producto
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error} <button onClick={load} className="underline ml-2">Reintentar</button>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
               placeholder="Buscar producto..."
               className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-[150px]
                          focus:outline-none focus:ring-2 focus:ring-brand-400" />
        <select value={String(filterCat)}
                onChange={(e) => setFilterCat(e.target.value === "all" ? "all" : Number(e.target.value))}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-brand-400">
          <option value="all">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterAvail} onChange={(e) => setFilterAvail(e.target.value as "all"|"yes"|"no")}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white
                           focus:outline-none focus:ring-2 focus:ring-brand-400">
          <option value="all">Todos</option>
          <option value="yes">Disponibles</option>
          <option value="no">No disponibles</option>
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-gray-400 text-sm">No hay productos que coincidan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs">Producto</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium text-xs hidden sm:table-cell">Categoría</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium text-xs">Precio</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium text-xs">Estado</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium text-xs">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}
                      className={`border-b border-gray-50 last:border-0 transition-opacity
                                  ${!p.available ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-xs">
                          {p.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {p.category.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggle(p)}
                        disabled={togglingId === p.id}
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors
                                    disabled:opacity-40
                                    ${p.available
                                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                      >
                        {togglingId === p.id ? "..." : p.available ? "Disponible" : "No disponible"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(p)}
                              className="text-brand-600 hover:text-brand-700 font-medium text-xs">
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <ProductFormModal form={form} categories={categories} editingId={editingId}
          saving={saving} error={formError} onChange={handleFormChange}
          onSubmit={handleSubmit} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}