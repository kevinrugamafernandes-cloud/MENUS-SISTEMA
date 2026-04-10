// UsersTab — Fase 5
// Gestión de usuarios internos: listar, crear, cambiar rol,
// resetear contraseña, activar/desactivar.

import { useState, useEffect, useCallback } from "react";
import { InternalUserAdmin, UserRole }  from "../../types";
import {
  fetchAdminUsers,
  createAdminUser,
  updateUserRole,
  resetUserPassword,
  setUserActive,
} from "../../services/api.service";
import { LoadingSpinner }    from "../shared/LoadingSpinner";
import { useToastContext }   from "../../hooks/useToastContext";

// ── Constantes ────────────────────────────────────────────────────────────────
const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN:   "Administrador",
  KITCHEN: "Cocina",
  CASHIER: "Caja",
};

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN:   "bg-purple-100 text-purple-700",
  KITCHEN: "bg-orange-100 text-orange-700",
  CASHIER: "bg-blue-100  text-blue-700",
};

// ── Modal: Nuevo usuario ──────────────────────────────────────────────────────
interface NewUserModalProps {
  onSave:  (name: string, password: string, role: UserRole) => Promise<void>;
  onClose: () => void;
  saving:  boolean;
  error:   string | null;
}

function NewUserModal({ onSave, onClose, saving, error }: NewUserModalProps) {
  const [name,     setName]     = useState("");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState<UserRole>("KITCHEN");
  const [showPass, setShowPass] = useState(false);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl
                      shadow-2xl p-6 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Nuevo usuario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre de usuario *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s/g, ""))}
              placeholder="sin espacios, ej: maria"
              autoFocus
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Contraseña * <span className="text-gray-400 font-normal">(mín. 6 caracteres)</span>
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm pr-10
                           focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
              >
                {showPass ? "Ocultar" : "Ver"}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Rol *</label>
            <div className="grid grid-cols-3 gap-2">
              {(["ADMIN", "KITCHEN", "CASHIER"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2.5 rounded-xl text-xs font-semibold border transition-colors
                              ${role === r
                                ? "border-brand-600 bg-brand-50 text-brand-700"
                                : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  {ROLE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2.5
                            rounded-xl text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancelar</button>
          <button
            onClick={() => onSave(name, password, role)}
            disabled={saving}
            className="btn-primary flex-1 text-sm"
          >
            {saving ? "Creando..." : "Crear usuario"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Modal: Resetear contraseña ────────────────────────────────────────────────
interface ResetPassModalProps {
  userName: string;
  onSave:   (password: string) => Promise<void>;
  onClose:  () => void;
  saving:   boolean;
  error:    string | null;
}

function ResetPassModal({ userName, onSave, onClose, saving, error }: ResetPassModalProps) {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl
                      shadow-2xl p-6 max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Resetear contraseña</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1">✕</button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Nueva contraseña para <span className="font-semibold text-gray-700">{userName}</span>
        </p>

        <div className="relative mb-4">
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm pr-10
                       focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"
          >
            {showPass ? "Ocultar" : "Ver"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl text-sm mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancelar</button>
          <button
            onClick={() => onSave(password)}
            disabled={saving || password.length < 6}
            className="btn-primary flex-1 text-sm disabled:opacity-40"
          >
            {saving ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function UsersTab() {
  const toast = useToastContext();

  const [users,      setUsers]      = useState<InternalUserAdmin[]>([]);
  const [loading,    setLoading]    = useState(true);

  // Modal nuevo usuario
  const [showNew,    setShowNew]    = useState(false);
  const [newSaving,  setNewSaving]  = useState(false);
  const [newError,   setNewError]   = useState<string | null>(null);

  // Modal reset password
  const [resetUser,  setResetUser]  = useState<InternalUserAdmin | null>(null);
  const [resetSaving,setResetSaving]= useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Cambio de rol inline
  const [editingRole,    setEditingRole]    = useState<number | null>(null);
  const [roleSaving,     setRoleSaving]     = useState(false);

  // Toggle activo en curso
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAdminUsers();
      setUsers(res.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  // ── Acciones ──────────────────────────────────────────────────────────────

  async function handleCreate(name: string, password: string, role: UserRole) {
    if (!name.trim())         return setNewError("El nombre es requerido");
    if (password.length < 6)  return setNewError("La contraseña debe tener al menos 6 caracteres");

    setNewSaving(true);
    setNewError(null);
    try {
      const res = await createAdminUser({ name: name.trim(), password, role });
      toast.success(`Usuario "${res.data.name}" creado`);
      setShowNew(false);
      await load();
    } catch (err) {
      setNewError(err instanceof Error ? err.message : "Error al crear usuario");
    } finally {
      setNewSaving(false);
    }
  }

  async function handleRoleChange(user: InternalUserAdmin, newRole: UserRole) {
    if (newRole === user.role) { setEditingRole(null); return; }
    setRoleSaving(true);
    try {
      await updateUserRole(user.id, newRole);
      toast.success(`Rol de "${user.name}" actualizado a ${ROLE_LABELS[newRole]}`);
      setEditingRole(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cambiar rol");
    } finally {
      setRoleSaving(false);
    }
  }

  async function handleResetPassword(password: string) {
    if (!resetUser) return;
    if (password.length < 6) return setResetError("Mínimo 6 caracteres");

    setResetSaving(true);
    setResetError(null);
    try {
      await resetUserPassword(resetUser.id, password);
      toast.success(`Contraseña de "${resetUser.name}" actualizada`);
      setResetUser(null);
    } catch (err) {
      setResetError(err instanceof Error ? err.message : "Error al cambiar contraseña");
    } finally {
      setResetSaving(false);
    }
  }

  async function handleToggleActive(user: InternalUserAdmin) {
    setTogglingId(user.id);
    try {
      await setUserActive(user.id, !user.active);
      const accion = !user.active ? "activado" : "desactivado";
      toast.success(`Usuario "${user.name}" ${accion}`);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al cambiar estado");
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) return <LoadingSpinner message="Cargando usuarios..." />;

  const activos   = users.filter((u) =>  u.active).length;
  const inactivos = users.filter((u) => !u.active).length;

  return (
    <div className="space-y-5">

      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Usuarios internos</h2>
          <p className="text-sm text-gray-500">
            {activos} activo{activos !== 1 ? "s" : ""}
            {inactivos > 0 && ` · ${inactivos} inactivo${inactivos !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={() => { setShowNew(true); setNewError(null); }}
          className="btn-primary text-sm py-2.5 px-5 self-start sm:self-auto"
        >
          + Nuevo usuario
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">👤</p>
            <p className="text-gray-400 text-sm">Sin usuarios registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Usuario</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Rol</th>
                  <th className="text-center px-4 py-3 text-gray-500 font-medium">Estado</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`border-b border-gray-50 last:border-0 transition-opacity
                                ${!user.active ? "opacity-50" : ""}`}
                  >
                    {/* Nombre */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center
                                        justify-center text-gray-600 text-xs font-bold flex-shrink-0">
                          {user.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">ID #{user.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rol — edición inline */}
                    <td className="px-4 py-3">
                      {editingRole === user.id ? (
                        <div className="flex gap-1.5 flex-wrap">
                          {(["ADMIN", "KITCHEN", "CASHIER"] as UserRole[]).map((r) => (
                            <button
                              key={r}
                              onClick={() => handleRoleChange(user, r)}
                              disabled={roleSaving}
                              className={`text-xs px-2.5 py-1 rounded-full font-semibold border
                                          transition-colors disabled:opacity-40
                                          ${user.role === r
                                            ? "border-brand-500 bg-brand-50 text-brand-700"
                                            : "border-gray-200 text-gray-500 hover:border-brand-400"}`}
                            >
                              {roleSaving && user.role === r ? "..." : ROLE_LABELS[r]}
                            </button>
                          ))}
                          <button
                            onClick={() => setEditingRole(null)}
                            className="text-xs text-gray-400 hover:text-gray-600 px-1"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingRole(user.id)}
                          title="Clic para cambiar rol"
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold
                                      cursor-pointer hover:opacity-80 transition-opacity
                                      ${ROLE_COLORS[user.role]}`}
                        >
                          {ROLE_LABELS[user.role]}
                        </button>
                      )}
                    </td>

                    {/* Estado activo */}
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleToggleActive(user)}
                        disabled={togglingId === user.id}
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold
                                    transition-colors disabled:opacity-40
                                    ${user.active
                                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                      >
                        {togglingId === user.id ? "..." : user.active ? "Activo" : "Inactivo"}
                      </button>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setResetUser(user); setResetError(null); }}
                        className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                        title="Resetear contraseña"
                      >
                        Resetear contraseña
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Nota informativa */}
      <p className="text-xs text-gray-400 leading-relaxed">
        💡 Haz clic en el rol de un usuario para cambiarlo. No puedes desactivar el último
        administrador activo del sistema.
      </p>

      {/* Modales */}
      {showNew && (
        <NewUserModal
          onSave={handleCreate}
          onClose={() => setShowNew(false)}
          saving={newSaving}
          error={newError}
        />
      )}
      {resetUser && (
        <ResetPassModal
          userName={resetUser.name}
          onSave={handleResetPassword}
          onClose={() => setResetUser(null)}
          saving={resetSaving}
          error={resetError}
        />
      )}
    </div>
  );
}