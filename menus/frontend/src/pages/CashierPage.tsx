// CashierPage — Fase 6
// Panel de caja con logout visible y navegación limpia

import { useNavigate } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";
import { useAuth } from "../hooks/useAuth";
import { Order, OrderStatus } from "../types";
import { LoadingSpinner } from "../components/shared/LoadingSpinner";
import { ErrorMessage } from "../components/shared/ErrorMessage";
import { OrderCard } from "../components/shared/OrderCard";

// Caja puede hacer todas las transiciones de estado
function getCashierActions(
  status: OrderStatus
): { label: string; status: OrderStatus; style: string }[] {
  switch (status) {
    case "PENDING":
      return [
        {
          label: "En preparación",
          status: "PREPARING",
          style: "bg-blue-100 text-blue-700 hover:bg-blue-200",
        },
        {
          label: "Cobrar",
          status: "PAID",
          style: "bg-green-600 text-white hover:bg-green-700",
        },
      ];
    case "PREPARING":
      return [
        {
          label: "Marcar listo",
          status: "READY",
          style: "bg-green-100 text-green-700 hover:bg-green-200",
        },
        {
          label: "Cobrar",
          status: "PAID",
          style: "bg-green-600 text-white hover:bg-green-700",
        },
      ];
    case "READY":
      return [
        {
          label: "✓ Cobrar",
          status: "PAID",
          style: "bg-green-600 text-white hover:bg-green-700",
        },
      ];
    default:
      return [];
  }
}

export function CashierPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const { orders, loading, error, updating, refetch, changeStatus } = useOrders();

  const totalActivo = orders.reduce((sum, o) => sum + o.total, 0);
  const readyOrders = orders.filter((o) => o.status === "READY");

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">💰 Panel de Caja</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              {orders.length} orden{orders.length !== 1 ? "es" : ""} activa
              {orders.length !== 1 ? "s" : ""}
              {user ? ` · ${user.name}` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Actualizar
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white hover:bg-red-500 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5">
        {/* Resumen rápido */}
        {orders.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Órdenes activas</p>
            </div>

            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{readyOrders.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Listas para cobrar</p>
            </div>

            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-brand-600">${totalActivo.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-0.5">Total en mesa</p>
            </div>
          </div>
        )}

        {loading && <LoadingSpinner message="Cargando órdenes..." />}

        {error && !loading && (
          <ErrorMessage
            title="Error al cargar las órdenes"
            message={error}
            onRetry={refetch}
          />
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Sin órdenes activas</h2>
            <p className="text-gray-400 text-sm">No hay pedidos pendientes en este momento</p>
          </div>
        )}

        {/* Órdenes listas primero */}
        {readyOrders.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-semibold text-green-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Listas para cobrar ({readyOrders.length})
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {readyOrders.map((order: Order) => (
                <div key={order.id} className="ring-2 ring-green-400 rounded-2xl overflow-hidden">
                  <OrderCard
                    order={order}
                    availableActions={getCashierActions(order.status)}
                    onChangeStatus={changeStatus}
                    isUpdating={updating === order.id}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Resto de órdenes activas */}
        {orders.filter((o) => o.status !== "READY").length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              En proceso
            </h2>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {orders
                .filter((o: Order) => o.status !== "READY")
                .map((order: Order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    availableActions={getCashierActions(order.status)}
                    onChangeStatus={changeStatus}
                    isUpdating={updating === order.id}
                  />
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}