// AdminPage — Fase 5: 8 tabs incluyendo Configuración y Usuarios

import { useState }              from "react";
import { AdminLayout, TabId }    from "../../components/admin/AdminLayout";
import { DashboardTab }          from "../../components/admin/DashboardTab";
import { ProductsTab }           from "../../components/admin/ProductsTab";
import { CategoriesTab }         from "../../components/admin/CategoriesTab";
import { TablesTab }             from "../../components/admin/TablesTab";
import { HistoryTab }            from "../../components/admin/HistoryTab";
import { ReportsTab }            from "../../components/admin/ReportsTab";
import { ConfigTab }             from "../../components/admin/ConfigTab";
import { UsersTab }              from "../../components/admin/UsersTab";
import { ToastProvider }         from "../../context/ToastContext";

export function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  return (
    <ToastProvider>
      <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === "dashboard"  && <DashboardTab />}
        {activeTab === "products"   && <ProductsTab />}
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "tables"     && <TablesTab />}
        {activeTab === "history"    && <HistoryTab />}
        {activeTab === "reports"    && <ReportsTab />}
        {activeTab === "config"     && <ConfigTab />}
        {activeTab === "users"      && <UsersTab />}
      </AdminLayout>
    </ToastProvider>
  );
}