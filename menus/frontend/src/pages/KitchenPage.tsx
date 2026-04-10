// KitchenPage — Fase 6
// Cocina con logout visible y navegación limpia

import { useNavigate } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";
import { useAuth } from "../hooks/useAuth";
import { Order, OrderStatus } from "../types";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { OrderCard } from "../components/shared/OrderCard";

// Acciones disponibles para cocina según estado actual
function getKitchenActions(
  status: OrderStatus
): { label: string; status: OrderStatus; style: string }[] {
  switch (status) {
    case "PENDING":
      return [
        {
          label: "🍳 Iniciar preparación",
          status: "PREPARING",
          style: "bg-blue-600 text-white hover:bg-blue-500",
        },
      ];
    case "PREPARING":
      return [
        {
          label: "✅ Marcar como listo",
          status: "READY",
          style: "bg-green-600 text-white hover:bg-green-500",
        },
      ];
    case "READY":
      return [];
    default:
      return [];
  }
}

function LastUpdated({ date }: { date: Date | null }) {
  if (!date) return null;

  const time = date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return <span className="text-gray-500 text-xs">Actualizado: {time}</span>;
}

export function KitchenPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const { orders, loading, error, lastUpdated, updating, refetch, changeStatus } =
    useOrders({ includePaid: false });

  const pendingOrders = orders.filter((o) => o.status === "PENDING");
  const preparingOrders = orders.filter((o) => o.status === "PREPARING");
  const readyOrders = orders.filter((o) => o.status === "READY");

  const totalActive = pendingOrders.length + preparingOrders.length;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white">🍳 Cocina</h1>
            <p className="text-gray-400 text-xs mt-0.5">
              {totalActive} orden{totalActive !== 1 ? "es" : ""} por preparar
              {user ? ` · ${user.name}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <LastUpdated date={lastUpdated} />

            <button
              onClick={refetch}
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-2 rounded-lg
                         text-sm font-medium transition-colors"
            >
              ↻ Actualizar
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-lg
                         text-sm font-medium transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 space-y-6">
        {/* Error no bloquea la UI — solo avisa */}
        {error && (
          <div
            className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3
                       rounded-xl text-sm flex items-center justify-between"
          >
            <span>{error}</span>
            <button onClick={refetch} className="underline ml-4 text-xs">
              Reintentar
            </button>
          </div>
        )}

        {loading && orders.length === 0 && (
          <LoadingSpinner message="Cargando órdenes..." />
        )}

        {!loading && orders.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-lg font-semibold text-gray-300 mb-1">
              Sin órdenes pendientes
            </h2>
            <p className="text-gray-500 text-sm">Todo al día por ahora</p>
          </div>
        )}

        {/* ── PENDIENTES ─────────────────────────────────────────────── */}
        {pendingOrders.length > 0 && (
          <section>
            <h2
              className="text-xs font-semibold text-yellow-400 uppercase tracking-widest
                         mb-3 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              Nuevas — esperando ({pendingOrders.length})
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pendingOrders.map((order: Order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  availableActions={getKitchenActions(order.status)}
                  onChangeStatus={changeStatus}
                  isUpdating={updating === order.id}
                  dark
                />
              ))}
            </div>
          </section>
        )}

        {/* ── EN PREPARACIÓN ─────────────────────────────────────────── */}
        {preparingOrders.length > 0 && (
          <section>
            <h2
              className="text-xs font-semibold text-blue-400 uppercase tracking-widest
                         mb-3 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              En preparación ({preparingOrders.length})
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {preparingOrders.map((order: Order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  availableActions={getKitchenActions(order.status)}
                  onChangeStatus={changeStatus}
                  isUpdating={updating === order.id}
                  dark
                />
              ))}
            </div>
          </section>
        )}

        {/* ── LISTOS — esperando a caja ──────────────────────────────── */}
        {readyOrders.length > 0 && (
          <section>
            <h2
              className="text-xs font-semibold text-green-400 uppercase tracking-widest
                         mb-3 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Listos — esperando cobro ({readyOrders.length})
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 opacity-60">
              {readyOrders.map((order: Order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  availableActions={[]}
                  onChangeStatus={changeStatus}
                  isUpdating={false}
                  dark
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}