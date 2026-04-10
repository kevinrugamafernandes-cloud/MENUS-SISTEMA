// ProductCard — Fase 6: acepta addLabel del idioma activo

import { useState, useEffect } from "react";
import { Product, CartItem }   from "../../types";

interface ProductCardProps {
  product:     Product;
  cartItem?:   CartItem;
  onAdd:       (product: Product) => void;
  onIncrement: (productId: number) => void;
  onDecrement: (productId: number) => void;
  addLabel?:   string;   // "Agregar" | "Add"
}

export function ProductCard({
  product, cartItem, onAdd, onIncrement, onDecrement, addLabel = "Agregar",
}: ProductCardProps) {
  const inCart   = !!cartItem;
  const quantity = cartItem?.quantity ?? 0;

  // Flash verde al agregar por primera vez
  const [justAdded, setJustAdded] = useState(false);
  function handleAdd() {
    onAdd(product);
    setJustAdded(true);
  }
  useEffect(() => {
    if (!justAdded) return;
    const t = setTimeout(() => setJustAdded(false), 600);
    return () => clearTimeout(t);
  }, [justAdded]);

  return (
    <div className={`card p-4 flex items-start gap-3 transition-all duration-300
                     ${justAdded ? "ring-2 ring-green-400 ring-offset-1" : ""}`}>

      {/* Imagen o placeholder */}
      <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-gray-100 overflow-hidden">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name}
               className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}
        <p className="text-brand-600 font-bold text-sm mt-1.5">${product.price.toFixed(2)}</p>
      </div>

      {/* Control */}
      <div className="flex-shrink-0">
        {!inCart ? (
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 bg-brand-600 text-white text-xs font-bold
                       px-3 py-2 rounded-xl active:bg-brand-700 transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M12 4v16m8-8H4" />
            </svg>
            {addLabel}
          </button>
        ) : (
          <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl px-1 py-0.5">
            <button
              onClick={() => onDecrement(product.id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                         hover:bg-gray-200 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M20 12H4" />
              </svg>
            </button>
            <span className="w-5 text-center font-bold text-sm text-gray-900">{quantity}</span>
            <button
              onClick={() => onIncrement(product.id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg
                         bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}