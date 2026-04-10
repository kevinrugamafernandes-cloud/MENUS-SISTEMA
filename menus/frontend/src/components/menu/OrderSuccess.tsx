// OrderSuccess — Fase 6: strings bilingüe

import { Lang, StringKey, t as translate } from "../../utils/ui-strings";

interface OrderSuccessProps {
  orderId:         number;
  tableNumber:     number;
  total:           number;
  currencySymbol?: string;
  restaurantName?: string;
  lang?:           Lang;
  onNewOrder:      () => void;
}

export function OrderSuccess({
  orderId, tableNumber, total,
  currencySymbol = "$",
  restaurantName = "US men",
  lang = "es",
  onNewOrder,
}: OrderSuccessProps) {
  const s = (key: StringKey) => translate(lang, key);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center
                    px-6 text-center">
      {/* Check animado */}
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center
                      mb-6 shadow-lg">
        <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24"
             stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">{s("pedido_enviado")}</h1>
      <p className="text-gray-500 text-sm mb-8 max-w-xs leading-relaxed">
        {s("pedido_recibido")}
        {restaurantName !== "US men" && (
          <> · <strong className="text-gray-700">{restaurantName}</strong></>
        )}
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-xs
                      p-6 mb-8 text-left">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{s("numero_orden")}</span>
            <span className="font-bold text-gray-900">#{orderId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{s("mesa_label")}</span>
            <span className="font-semibold text-gray-900">{tableNumber}</span>
          </div>
          <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
            <span className="text-gray-500 text-sm">{s("total")}</span>
            <span className="font-bold text-xl text-brand-600">
              {currencySymbol}{total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <button onClick={onNewOrder} className="btn-secondary text-sm">
        {s("nuevo_pedido")}
      </button>
    </div>
  );
}