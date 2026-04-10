// ConfigTab — Fase 5
// Configuración general del negocio: nombre, bienvenida, moneda,
// logo, colores, horario, nota de pie.

import { useState, useEffect, useCallback } from "react";
import { BusinessConfig }       from "../../types";
import { fetchAdminConfig, updateAdminConfig } from "../../services/api.service";
import { LoadingSpinner }       from "../shared/LoadingSpinner";
import { useToastContext }      from "../../hooks/useToastContext";

// ── Componente de campo de formulario reutilizable ────────────────────────────
function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const INPUT = `w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
               focus:outline-none focus:ring-2 focus:ring-brand-400 transition-shadow`;

export function ConfigTab() {
  const toast = useToastContext();

  const [config,  setConfig]  = useState<BusinessConfig | null>(null);
  const [form,    setForm]    = useState<Partial<BusinessConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [dirty,   setDirty]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminConfig();
      setConfig(res.data);
      setForm(res.data);
      setDirty(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar configuración");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  function handleChange(field: keyof BusinessConfig, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await updateAdminConfig(form);
      setConfig(res.data);
      setForm(res.data);
      setDirty(false);
      toast.success("Configuración guardada correctamente");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    if (config) { setForm(config); setDirty(false); }
  }

  if (loading) return <LoadingSpinner message="Cargando configuración..." />;

  return (
    <div className="space-y-6 max-w-2xl">

      {/* Cabecera */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Configuración del negocio</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Estos datos personalizan la experiencia del cliente QR
          </p>
        </div>
        {dirty && (
          <div className="flex gap-2">
            <button
              onClick={handleDiscard}
              className="btn-secondary text-sm py-2 px-4"
            >
              Descartar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-sm py-2 px-4"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        )}
      </div>

      {/* Sección: Identidad */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">
          Identidad del restaurante
        </h3>

        <Field label="Nombre del restaurante *">
          <input
            type="text"
            value={form.nombre ?? ""}
            onChange={(e) => handleChange("nombre", e.target.value)}
            placeholder="Mi Restaurante"
            className={INPUT}
          />
        </Field>

        <Field
          label="URL del logo"
          hint="Deja vacío para usar el ícono por defecto. Usa una URL pública (https://...)."
        >
          <input
            type="url"
            value={form.logo_url ?? ""}
            onChange={(e) => handleChange("logo_url", e.target.value)}
            placeholder="https://mi-restaurante.com/logo.png"
            className={INPUT}
          />
          {form.logo_url && (
            <div className="mt-2 flex items-center gap-3">
              <img
                src={form.logo_url}
                alt="Vista previa del logo"
                className="w-12 h-12 rounded-xl object-contain border border-gray-100"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <span className="text-xs text-gray-400">Vista previa</span>
            </div>
          )}
        </Field>

        <Field label="Color principal (hex)" hint="Color de botones y acentos en el menú del cliente.">
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={form.color_principal ?? "#ea580c"}
              onChange={(e) => handleChange("color_principal", e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5"
            />
            <input
              type="text"
              value={form.color_principal ?? ""}
              onChange={(e) => handleChange("color_principal", e.target.value)}
              placeholder="#ea580c"
              className={`${INPUT} flex-1`}
            />
          </div>
        </Field>
      </div>

      {/* Sección: Mensajes del cliente */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">
          Mensajes visibles al cliente
        </h3>

        <Field label="Mensaje de bienvenida" hint="Se muestra en la parte superior del menú QR.">
          <textarea
            value={form.bienvenida ?? ""}
            onChange={(e) => handleChange("bienvenida", e.target.value)}
            rows={2}
            placeholder="¡Bienvenido! Haz tu pedido."
            className={`${INPUT} resize-none`}
            maxLength={200}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {(form.bienvenida ?? "").length}/200
          </p>
        </Field>

        <Field label="Nota de pie de página" hint="Texto breve al final del menú (agradecimiento, redes, etc.).">
          <input
            type="text"
            value={form.nota_pie ?? ""}
            onChange={(e) => handleChange("nota_pie", e.target.value)}
            placeholder="Gracias por tu visita. ¡Vuelve pronto!"
            className={INPUT}
            maxLength={200}
          />
        </Field>
      </div>

      {/* Sección: Moneda y horario */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">
          Operación
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Código de moneda" hint="Ej: USD, CRC, MXN">
            <input
              type="text"
              value={form.moneda ?? ""}
              onChange={(e) => handleChange("moneda", e.target.value.toUpperCase())}
              placeholder="USD"
              maxLength={10}
              className={INPUT}
            />
          </Field>
          <Field label="Símbolo de moneda" hint="Ej: $, ₡, Q">
            <input
              type="text"
              value={form.simbolo_moneda ?? ""}
              onChange={(e) => handleChange("simbolo_moneda", e.target.value)}
              placeholder="$"
              maxLength={5}
              className={INPUT}
            />
          </Field>
        </div>

        <Field label="Horario" hint="Texto libre de horario de atención.">
          <input
            type="text"
            value={form.horario ?? ""}
            onChange={(e) => handleChange("horario", e.target.value)}
            placeholder="Lun–Dom 10:00–22:00"
            maxLength={100}
            className={INPUT}
          />
        </Field>
      </div>

      {/* Botón de guardado al pie si hay cambios */}
      {dirty && (
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={handleDiscard} className="btn-secondary text-sm py-2.5 px-5">
            Descartar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm py-2.5 px-5"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      )}
    </div>
  );
}