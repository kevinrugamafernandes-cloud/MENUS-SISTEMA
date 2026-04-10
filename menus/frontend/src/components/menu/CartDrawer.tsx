// CartDrawer — Fase 6: strings dinámicos según idioma activo

import { CartItem }          from "../../types";
import { Lang, StringKey, t as translate } from "../../utils/ui-strings";

interface CartDrawerProps {
  items:            CartItem[];
  total:            number;
  currencySymbol?:  string;
  lang?:            Lang;
  isOpen:           boolean;
  onClose:          () => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onUpdateNotes:    (productId: number, notes: string) => void;
  onRemove:         (productId: number) => void;
  onConfirm:        () => void;
  isSubmitting:     boolean;
}

export function CartDrawer({
  items, total, currencySymbol = "$", lang = "es",
  isOpen, onClose, onUpdateQuantity, onUpdateNotes, onRemove, onConfirm, isSubmitting,
}: CartDrawerProps) {
  const s = (key: StringKey) => translate(lang, key);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl
                      flex flex-col max-h-[88vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{s("tu_pedido")}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full
                       bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
            aria-label={s("cerrar")}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Lista de ítems */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-4xl mb-3">🛒</span>
              <p className="text-gray-400 text-sm">{s("carrito_vacio")}</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id}
                   className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-semibold text-sm text-gray-900 leading-snug">
                    {item.product.name}
                  </span>
                  <span className="font-bold text-sm text-gray-900 whitespace-nowrap">
                    {currencySymbol}{(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-1 py-0.5">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full
                                 hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                           stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                              d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full
                                 hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
                           stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                              d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                  <span className="text-xs text-gray-400">
                    {currencySymbol}{item.product.price.toFixed(2)} c/u
                  </span>
                  <button
                    onClick={() => onRemove(item.product.id)}
                    className="ml-auto text-red-400 hover:text-red-500 p-1 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                    </svg>
                  </button>
                </div>

                <input
                  type="text"
                  placeholder={s("notas_placeholder")}
                  value={item.notes}
                  onChange={(e) => onUpdateNotes(item.product.id, e.target.value)}
                  maxLength={200}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2
                             placeholder:text-gray-300 focus:outline-none focus:border-brand-400
                             focus:ring-1 focus:ring-brand-400 transition-colors"
                />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 font-semibold">{s("total")}</span>
            <span className="text-2xl font-bold text-gray-900">
              {currencySymbol}{total.toFixed(2)}
            </span>
          </div>
          <button
            onClick={onConfirm}
            disabled={items.length === 0 || isSubmitting}
            className="btn-primary w-full text-center text-base"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white
                                 rounded-full animate-spin" />
                {s("enviando_pedido")}
              </span>
            ) : s("confirmar_pedido")}
          </button>
        </div>
      </div>
    </>
  );
}