// ui-strings.ts — Fase 6 (versión final)
// Sistema bilingüe ES/EN para el cliente QR.
// El panel admin mantiene español inline (uso interno).
//
// Arquitectura: objeto de dos llaves (es | en).
// El contexto LanguageContext expone el idioma activo y la función t().

export type Lang = "es" | "en";

export const STRINGS = {
  es: {
    // Sistema
    brand_name:         "US men",
    brand_subtitle:     "Unification System",

    // Header del menú
    mesa_label:         "Mesa",
    mi_pedido:          "Mi pedido",
    ver_pedido:         "Ver pedido",

    // Estados de carga
    cargando_menu:      "Cargando el menú...",
    error_cargar_menu:  "No pudimos cargar el menú",
    reintentar:         "Intentar de nuevo",

    // Carrito
    tu_pedido:          "Tu pedido",
    carrito_vacio:      "Tu carrito está vacío",
    notas_placeholder:  "Notas (ej: sin cebolla)",
    total:              "Total",
    confirmar_pedido:   "Confirmar pedido",
    enviando_pedido:    "Enviando pedido...",
    cerrar:             "Cerrar",
    agregar_mas:        "Agregar más",

    // Éxito
    pedido_enviado:     "¡Pedido enviado!",
    pedido_recibido:    "Tu pedido fue recibido. El equipo lo preparará pronto.",
    numero_orden:       "Número de orden",
    nuevo_pedido:       "Agregar más al pedido",

    // Toast al agregar producto
    toast_agregado:     "agregado",

    // Selector de idioma
    elige_idioma:       "Elige tu idioma",
    continuar:          "Continuar",

    // Accesibilidad
    reducir_cantidad:   "Reducir cantidad",
    aumentar_cantidad:  "Aumentar cantidad",
    agregar_producto:   "Agregar",
  },
  en: {
    brand_name:         "US men",
    brand_subtitle:     "Unification System",

    mesa_label:         "Table",
    mi_pedido:          "My order",
    ver_pedido:         "View order",

    cargando_menu:      "Loading menu...",
    error_cargar_menu:  "Couldn't load the menu",
    reintentar:         "Try again",

    tu_pedido:          "Your order",
    carrito_vacio:      "Your cart is empty",
    notas_placeholder:  "Notes (e.g. no onions)",
    total:              "Total",
    confirmar_pedido:   "Confirm order",
    enviando_pedido:    "Sending order...",
    cerrar:             "Close",
    agregar_mas:        "Add more",

    pedido_enviado:     "Order placed!",
    pedido_recibido:    "Your order was received. Our team will prepare it shortly.",
    numero_orden:       "Order number",
    nuevo_pedido:       "Add more items",

    toast_agregado:     "added",

    elige_idioma:       "Choose your language",
    continuar:          "Continue",

    reducir_cantidad:   "Reduce quantity",
    aumentar_cantidad:  "Increase quantity",
    agregar_producto:   "Add",
  },
} as const;

export type StringKey = keyof typeof STRINGS["es"];

/** Devuelve el string del idioma activo. Fallback a español. */
export function t(lang: Lang, key: StringKey): string {
  return STRINGS[lang]?.[key] ?? STRINGS["es"][key];
}