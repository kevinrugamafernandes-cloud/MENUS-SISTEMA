// Validadores de entrada para la API MenUS — Fase 2
// Actualizado: IN_PREPARATION renombrado a PREPARING

import { z } from "zod";

export const createOrderSchema = z.object({
  tableNumber: z
    .number({ required_error: "El número de mesa es requerido" })
    .int("El número de mesa debe ser entero")
    .positive("El número de mesa debe ser positivo"),
  items: z
    .array(
      z.object({
        productId: z.number({ required_error: "El ID de producto es requerido" }).int().positive(),
        quantity:  z.number({ required_error: "La cantidad es requerida" }).int().positive("La cantidad debe ser al menos 1"),
        notes:     z.string().max(200, "Las notas no pueden superar 200 caracteres").optional(),
      })
    )
    .min(1, "La orden debe tener al menos un producto"),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["PENDING", "PREPARING", "READY", "PAID"], {
    errorMap: () => ({
      message: "Estado inválido. Valores permitidos: PENDING, PREPARING, READY, PAID",
    }),
  }),
});

export type CreateOrderInput       = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;