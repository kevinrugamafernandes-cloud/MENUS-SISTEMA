// AddedToCartToast — Fase 6: acepta suffix del idioma activo

import { useEffect, useState } from "react";

interface AddedToCartToastProps {
  productName: string;
  visible:     boolean;
  onHide:      () => void;
  suffix?:     string;   // "agregado" | "added"
}

export function AddedToCartToast({
  productName, visible, onHide, suffix = "agregado",
}: AddedToCartToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setShow(true);
    const t = setTimeout(() => {
      setShow(false);
      setTimeout(onHide, 300);
    }, 1800);
    return () => clearTimeout(t);
  }, [visible, onHide]);

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300
                  ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3 pointer-events-none"}`}
    >
      <div className="flex items-center gap-2.5 bg-gray-900 text-white
                      px-4 py-3 rounded-2xl shadow-xl text-sm font-medium whitespace-nowrap">
        <span className="text-green-400 text-base">✓</span>
        <span className="max-w-[180px] truncate">{productName}</span>
        <span className="text-gray-400">{suffix}</span>
      </div>
    </div>
  );
}