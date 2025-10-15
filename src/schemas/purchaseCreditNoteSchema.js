// src/schemas/purchaseCreditNoteSchema.js

import { z } from 'zod';

// Esquema para un único detalle de la Nota de Crédito sobre Compra.
// Basado en PurchaseCreditNoteDetailCreateDTO.java
const purchaseCreditNoteDetailSchema = z.object({
  // Uno de estos dos debe existir.
  productId: z.number().int().positive().nullable(),
  catalogId: z.number().int().positive().nullable(),

  // Campos que el usuario puede modificar
  quantity: z.coerce.number({ invalid_type_error: 'La cantidad es obligatoria.' })
    .int('La cantidad debe ser un número entero.')
    .min(1, 'La cantidad a devolver debe ser al menos 1.'),

  // Campos que se calculan o vienen de la compra original
  unitPrice: z.coerce.number(),
  subtotal: z.coerce.number().optional(),
  tax: z.boolean(),
  lineDescription: z.string().nullable().optional(),

}).refine(data => {
  // Regla de negocio: Un detalle es un producto O una cuenta, no ambos.
  const hasProduct = data.productId !== null;
  const hasCatalog = data.catalogId !== null;
  return (hasProduct && !hasCatalog) || (!hasProduct && hasCatalog);
}, {
  message: "Error interno: El detalle debe ser un producto o una cuenta, no ambos.",
  path: ["productId"], // Asocia el error a un campo para debugging.
});

// Esquema principal para el formulario de Nota de Crédito sobre Compra.
// Basado en PurchaseCreditNoteCreateDTO.java
export const purchaseCreditNoteSchema = z.object({
  // Cabecera
  documentNumber: z.string()
    .min(1, 'El número de documento es obligatorio.')
    .max(20, 'El número de documento no puede exceder los 20 caracteres.'),

  description: z.string()
    .min(1, 'La descripción es obligatoria.')
    .max(255, 'La descripción no puede exceder los 255 caracteres.'),

  issueDate: z.string().min(1, 'La fecha de emisión es obligatoria.'),

  purchaseId: z.number({ invalid_type_error: 'Debe seleccionar una compra válida.' })
    .int()
    .positive('Debe seleccionar una compra válida.'),

  // Totales (calculados en el frontend)
  subtotalAmount: z.coerce.number(),
  vatAmount: z.coerce.number(),
  totalAmount: z.coerce.number(),

  // Array de detalles
  details: z.array(purchaseCreditNoteDetailSchema)
    .min(1, 'Debe devolver al menos un ítem en la nota de crédito.'),
});