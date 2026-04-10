// ConfigService — Fase 5
// Lee y actualiza la configuración general del negocio.
// El modelo BusinessConfig es key/value; este servicio
// presenta una interfaz tipada sobre esa estructura.

import { prisma } from "../lib/prisma";

// Claves conocidas de configuración (documentadas aquí)
export type ConfigKey =
  | "nombre"         // nombre visible del restaurante
  | "bienvenida"     // mensaje de bienvenida en el cliente QR
  | "moneda"         // código de moneda (USD, CRC, MXN...)
  | "simbolo_moneda" // símbolo ($, ₡, Q...)
  | "nota_pie"       // nota de pie de página en el cliente QR
  | "logo_url"       // URL del logo (vacío = sin logo)
  | "color_principal"// hex del color principal UI
  | "horario"        // texto libre de horario
  | "activo";        // "true" | "false"

export interface BusinessConfigMap {
  nombre:          string;
  bienvenida:      string;
  moneda:          string;
  simbolo_moneda:  string;
  nota_pie:        string;
  logo_url:        string;
  color_principal: string;
  horario:         string;
  activo:          string;
}

const DEFAULTS: BusinessConfigMap = {
  nombre:          "Mi Restaurante",
  bienvenida:      "¡Bienvenido! Haz tu pedido.",
  moneda:          "USD",
  simbolo_moneda:  "$",
  nota_pie:        "",
  logo_url:        "",
  color_principal: "#ea580c",
  horario:         "",
  activo:          "true",
};

export const configService = {
  /**
   * Devuelve toda la configuración como un objeto tipado.
   * Valores no encontrados en BD usan los defaults.
   */
  async getAll(): Promise<BusinessConfigMap> {
    const rows = await prisma.businessConfig.findMany();
    const map  = new Map(rows.map((r) => [r.key, r.value]));

    const result = { ...DEFAULTS };
    for (const key of Object.keys(DEFAULTS) as ConfigKey[]) {
      if (map.has(key)) result[key] = map.get(key)!;
    }
    return result;
  },

  /**
   * Actualiza uno o más campos de configuración.
   * Solo acepta claves conocidas; ignora claves desconocidas.
   */
  async update(data: Partial<BusinessConfigMap>): Promise<BusinessConfigMap> {
    const validKeys = Object.keys(DEFAULTS) as ConfigKey[];
    const updates   = Object.entries(data).filter(([k]) =>
      validKeys.includes(k as ConfigKey)
    );

    // Upsert en paralelo para eficiencia
    await Promise.all(
      updates.map(([key, value]) =>
        prisma.businessConfig.upsert({
          where:  { key },
          update: { value: String(value) },
          create: { key,  value: String(value) },
        })
      )
    );

    return this.getAll();
  },

  /**
   * Devuelve solo las claves necesarias para el cliente QR (endpoint público).
   * Nunca expone datos sensibles.
   */
  async getPublic() {
    const cfg = await this.getAll();
    return {
      nombre:         cfg.nombre,
      bienvenida:     cfg.bienvenida,
      simbolo_moneda: cfg.simbolo_moneda,
      moneda:         cfg.moneda,
      nota_pie:       cfg.nota_pie,
      logo_url:       cfg.logo_url,
    };
  },
};