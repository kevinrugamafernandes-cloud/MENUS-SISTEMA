// MenuPage — Fase 6 (versión comercial final)
// Integra: selector de idioma, config del negocio, strings dinámicos ES/EN.

import { useState, useCallback } from "react";
import { useParams, Navigate }   from "react-router-dom";
import { useMenu }               from "../hooks/useMenu";
import { useCart }               from "../hooks/useCart";
import { useBusinessConfig }     from "../context/BusinessConfigContext";
import { useLanguage }           from "../context/LanguageContext";
import { createOrder }           from "../services/api.service";
import { Product, Order }        from "../types";
import { LoadingSpinner }        from "../components/shared/LoadingSpinner";
import { ErrorMessage }          from "../components/shared/ErrorMessage";
import { ProductCard }           from "../components/menu/ProductCard";
import { CartDrawer }            from "../components/menu/CartDrawer";
import { OrderSuccess }          from "../components/menu/OrderSuccess";
import { AddedToCartToast }      from "../components/menu/AddedToCartToast";
import { LanguageSelector }      from "../components/menu/LanguageSelector";

export function MenuPage() {
  const { tableNumber: tableNumberStr } = useParams<{ tableNumber: string }>();
  const tableNumber = Number(tableNumberStr);

  if (!tableNumberStr || isNaN(tableNumber) || tableNumber <= 0) {
    return <Navigate to="/" replace />;
  }

  // Idioma activo + función de traducción
  const { t, hasChosen, lang, setLang } = useLanguage();

  // Config del negocio
  const { config } = useBusinessConfig();
  const restaurantName = config?.nombre        ?? "US men";
  const welcomeMessage = config?.bienvenida    ?? "";
  const currencySymbol = config?.simbolo_moneda ?? "$";
  const footerNote     = config?.nota_pie      ?? "";

  const { menuData, loading, error, refetch } = useMenu(tableNumber);
  const cart = useCart();

  const [cartOpen,       setCartOpen]       = useState(false);
  const [isSubmitting,   setIsSubmitting]   = useState(false);
  const [submitError,    setSubmitError]    = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const [toastProduct, setToastProduct] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const handleAdd = useCallback((product: Product) => {
    cart.addItem(product);
    setToastProduct(product.name);
    setToastVisible(true);
  }, [cart]);

  async function handleConfirm() {
    if (cart.items.length === 0) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await createOrder({
        tableNumber,
        items: cart.items.map((i) => ({
          productId: i.product.id,
          quantity:  i.quantity,
          notes:     i.notes || undefined,
        })),
      });
      setConfirmedOrder(res.data);
      cart.clearCart();
      setCartOpen(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("enviando_pedido"));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Mostrar selector de idioma si el usuario aún no eligió
  if (!hasChosen) {
    return <LanguageSelector />;
  }

  if (confirmedOrder) {
    return (
      <OrderSuccess
        orderId={confirmedOrder.id}
        tableNumber={tableNumber}
        total={confirmedOrder.total}
        currencySymbol={currencySymbol}
        restaurantName={restaurantName}
        lang={lang}
        onNewOrder={() => setConfirmedOrder(null)}
      />
    );
  }

  if (loading) return <LoadingSpinner message={t("cargando_menu")} fullScreen />;
  if (error)   return (
    <ErrorMessage
      title={t("error_cargar_menu")}
      message={error}
      onRetry={refetch}
    />
  );
  if (!menuData) return null;

  const { table, menu } = menuData;
  const categories = Object.keys(menu);

  return (
    <div className="min-h-screen bg-gray-50 pb-28">

      <AddedToCartToast
        productName={toastProduct}
        visible={toastVisible}
        onHide={() => setToastVisible(false)}
        suffix={t("toast_agregado")}
      />

      {/* Header personalizado */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {config?.logo_url ? (
              <img
                src={config.logo_url}
                alt={restaurantName}
                className="w-9 h-9 rounded-xl object-contain flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <span className="text-2xl flex-shrink-0">🍽️</span>
            )}
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-gray-900 truncate leading-tight">
                {restaurantName}
              </h1>
              <p className="text-xs text-brand-600 font-medium">
                {t("mesa_label")} {table.number}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {/* Selector de idioma compacto */}
            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              title="Cambiar idioma / Change language"
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5
                         border border-gray-200 rounded-lg font-medium transition-colors"
            >
              {lang === "es" ? "EN" : "ES"}
            </button>

            {/* Botón carrito */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1.5 bg-brand-600 text-white
                         px-3 py-2.5 rounded-xl font-semibold text-sm
                         active:bg-brand-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden xs:inline text-xs">{t("mi_pedido")}</span>
              {cart.totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs
                                 font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {welcomeMessage && (
          <div className="px-4 pb-3 border-t border-gray-50">
            <p className="text-xs text-gray-500 leading-relaxed pt-2">{welcomeMessage}</p>
          </div>
        )}
      </header>

      {submitError && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-700
                        px-4 py-3 rounded-xl text-sm">
          {submitError}
        </div>
      )}

      {/* Menú por categorías */}
      <main className="px-4 pt-5 space-y-6">
        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3 px-1">
              {cat}
            </h2>
            <div className="space-y-3">
              {(menu[cat] as Product[]).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  cartItem={cart.getItem(product.id)}
                  onAdd={handleAdd}
                  onIncrement={(id) => {
                    const item = cart.getItem(id);
                    if (item) cart.updateQuantity(id, item.quantity + 1);
                  }}
                  onDecrement={(id) => {
                    const item = cart.getItem(id);
                    if (item) cart.updateQuantity(id, item.quantity - 1);
                  }}
                  addLabel={t("agregar_producto")}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      {footerNote && (
        <footer className="mt-8 px-4 py-6 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">{footerNote}</p>
        </footer>
      )}

      {/* Barra flotante del carrito */}
      {cart.totalItems > 0 && !cartOpen && (
        <div className="fixed bottom-0 inset-x-0 px-4 pb-6 z-30">
          <button
            onClick={() => setCartOpen(true)}
            className="btn-primary w-full flex items-center justify-between shadow-2xl"
          >
            <span className="bg-white/20 text-white text-xs font-bold w-6 h-6 rounded-full
                             flex items-center justify-center">
              {cart.totalItems}
            </span>
            <span>{t("ver_pedido")}</span>
            <span className="font-bold">{currencySymbol}{cart.total.toFixed(2)}</span>
          </button>
        </div>
      )}

      <CartDrawer
        items={cart.items}
        total={cart.total}
        currencySymbol={currencySymbol}
        lang={lang}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onUpdateQuantity={cart.updateQuantity}
        onUpdateNotes={cart.updateNotes}
        onRemove={cart.removeItem}
        onConfirm={handleConfirm}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}