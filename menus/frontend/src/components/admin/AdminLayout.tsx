// AdminLayout — Fase 6 (versión final)
// Branding US men, 8 tabs, sidebar premium.

import { ReactNode, useState } from "react";
import { useNavigate }          from "react-router-dom";
import { useAuth }              from "../../hooks/useAuth";

export type TabId =
  | "dashboard" | "products" | "categories"
  | "tables"    | "history"  | "reports"
  | "config"    | "users";

interface AdminLayoutProps {
  activeTab:   TabId;
  onTabChange: (tab: TabId) => void;
  children:    ReactNode;
}

const NAV_ITEMS: {
  id: TabId; label: string; icon: string; dividerBefore?: boolean;
}[] = [
  { id: "dashboard",  label: "Resumen",      icon: "📊" },
  { id: "products",   label: "Productos",    icon: "🍔" },
  { id: "categories", label: "Categorías",   icon: "🗂️" },
  { id: "tables",     label: "Mesas",        icon: "🪑" },
  { id: "history",    label: "Historial",    icon: "📋" },
  { id: "reports",    label: "Reportes",     icon: "📈" },
  { id: "config",     label: "Configuración",icon: "⚙️",  dividerBefore: true },
  { id: "users",      label: "Usuarios",     icon: "👥" },
];

const ROLE_LABELS: Record<string, string> = {
  ADMIN:   "Administrador",
  KITCHEN: "Cocina",
  CASHIER: "Caja",
};

function NavButton({
  item, active, onClick,
}: { item: typeof NAV_ITEMS[0]; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                  font-medium transition-all duration-150 text-left group
                  ${active
                    ? "bg-brand-600 text-white shadow-sm shadow-brand-900/30"
                    : "text-gray-400 hover:text-white hover:bg-white/5"}`}
    >
      <span className="text-base leading-none">{item.icon}</span>
      <span>{item.label}</span>
    </button>
  );
}

export function AdminLayout({ activeTab, onTabChange, children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const activeName = NAV_ITEMS.find((n) => n.id === activeTab);

  function renderNav(onClickItem: (id: TabId) => void) {
    return NAV_ITEMS.map((item) => (
      <div key={item.id}>
        {item.dividerBefore && (
          <div className="border-t border-white/5 my-2 mx-1" />
        )}
        <NavButton
          item={item}
          active={activeTab === item.id}
          onClick={() => onClickItem(item.id)}
        />
      </div>
    ));
  }

  const sidebarContent = (onClickItem: (id: TabId) => void, showClose = false) => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700
                            flex items-center justify-center text-xl flex-shrink-0">
              🍽️
            </div>
            <div>
              <p className="text-white font-black text-base leading-none tracking-tight">
                US men
              </p>
              <p className="text-gray-600 text-[10px] mt-0.5 tracking-wider uppercase">
                Unification System
              </p>
            </div>
          </div>
          {showClose && (
            <button onClick={() => setSidebarOpen(false)}
                    className="text-gray-600 hover:text-white p-1 transition-colors">
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
        {renderNav(onClickItem)}
      </nav>

      {/* Usuario */}
      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-full bg-brand-700/40 border border-brand-600/30
                          flex items-center justify-center text-brand-300 text-xs
                          font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
            <p className="text-gray-600 text-[10px]">
              {ROLE_LABELS[user?.role ?? ""] ?? user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-gray-600 hover:text-red-400 text-xs
                     py-1.5 transition-colors flex items-center gap-1.5"
        >
          <span>←</span> Cerrar sesión
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Sidebar desktop ─────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-58 bg-gray-950 border-r border-white/5
                        fixed inset-y-0 left-0 z-20" style={{ width: "14.5rem" }}>
        {sidebarContent(onTabChange)}
      </aside>

      {/* ── Overlay móvil ───────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-30 md:hidden backdrop-blur-sm"
             onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar móvil ───────────────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-gray-950
                         border-r border-white/5 transition-transform duration-300 md:hidden
                         ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
             style={{ width: "14.5rem" }}>
        {sidebarContent(
          (id) => { onTabChange(id); setSidebarOpen(false); },
          true
        )}
      </aside>

      {/* ── Contenido principal ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: "0" }}
           // Offset desktop via clase
      >
        <div className="md:ml-[14.5rem] flex flex-col min-h-screen">

          {/* Topbar */}
          <header className="bg-white border-b border-gray-200 px-4 py-3.5 flex items-center
                             justify-between sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden text-gray-400 hover:text-gray-700 p-1"
                aria-label="Abrir menú"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-sm font-semibold text-gray-900">
                  {activeName?.icon} {activeName?.label}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-xs text-gray-400">
                <span className="font-medium text-gray-600">{user?.name}</span>
                {" · "}{ROLE_LABELS[user?.role ?? ""] ?? user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors
                           border border-gray-200 rounded-xl px-3 py-1.5 hover:border-red-200"
              >
                Salir
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}