// App.tsx — Fase 6
// Login público
// Admin, Kitchen y Cashier protegidos por rol
// Cliente QR sigue público

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MenuPage } from "./pages/MenuPage";
import { KitchenPage } from "./pages/KitchenPage";
import { CashierPage } from "./pages/CashierPage";
import { AdminPage } from "./pages/admin/AdminPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { ProtectedRoute } from "./components/shared/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Raíz */}
        <Route path="/" element={<Navigate to="/menu/mesa/1" replace />} />

        {/* Cliente QR — público */}
        <Route path="/menu/mesa/:tableNumber" element={<MenuPage />} />

        {/* Login — público */}
        <Route path="/login" element={<LoginPage />} />

        {/* Admin — solo ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* Cocina — solo KITCHEN */}
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute requiredRole="KITCHEN">
              <KitchenPage />
            </ProtectedRoute>
          }
        />

        {/* Caja — solo CASHIER */}
        <Route
          path="/cashier"
          element={
            <ProtectedRoute requiredRole="CASHIER">
              <CashierPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;