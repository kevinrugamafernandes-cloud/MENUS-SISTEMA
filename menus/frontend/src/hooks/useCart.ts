// useCart - Hook para gestionar el carrito de compras del cliente
// Maneja agregar, quitar, modificar cantidad y notas

import { useState, useCallback } from "react";
import { CartItem, Product } from "../types";

interface UseCartResult {
  items: CartItem[];
  totalItems: number;
  total: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  updateNotes: (productId: number, notes: string) => void;
  clearCart: () => void;
  isInCart: (productId: number) => boolean;
  getItem: (productId: number) => CartItem | undefined;
}

export function useCart(): UseCartResult {
  const [items, setItems] = useState<CartItem[]>([]);

  // Agregar producto al carrito (si ya existe, incrementa cantidad)
  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, quantity: 1, notes: "" }];
    });
  }, []);

  // Eliminar producto del carrito completamente
  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  // Actualizar cantidad de un producto (si llega a 0, se elimina)
  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
    );
  }, []);

  // Actualizar notas de un ítem
  const updateNotes = useCallback((productId: number, notes: string) => {
    setItems((prev) =>
      prev.map((i) => (i.product.id === productId ? { ...i, notes } : i))
    );
  }, []);

  // Limpiar carrito completo
  const clearCart = useCallback(() => setItems([]), []);

  // Verificar si un producto está en el carrito
  const isInCart = useCallback(
    (productId: number) => items.some((i) => i.product.id === productId),
    [items]
  );

  // Obtener ítem por ID de producto
  const getItem = useCallback(
    (productId: number) => items.find((i) => i.product.id === productId),
    [items]
  );

  // Totales calculados
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return {
    items,
    totalItems,
    total,
    addItem,
    removeItem,
    updateQuantity,
    updateNotes,
    clearCart,
    isInCart,
    getItem,
  };
}