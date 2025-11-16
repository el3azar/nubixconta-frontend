// src/schemas/incomeTaxSchema.js

import { z } from 'zod';

// Esquema para la creación de una Retención de ISR
export const incomeTaxSchema = z.object({
  // --- CAMPOS DIRECTOS DEL DTO ---

  purchaseId: z.number({ required_error: 'Debe seleccionar una compra.' })
    .int()
    .positive('Debe seleccionar una compra válida.'),

  documentNumber: z.string()
    .min(1, 'El número de documento es obligatorio.')
    .max(100, 'El número de documento no puede exceder los 100 caracteres.'),

  description: z.string()
    .min(1, 'La descripción es obligatoria.')
    .max(256, 'La descripción no puede exceder los 256 caracteres.'),

  issueDate: z.string()
    .min(1, 'La fecha de emisión es obligatoria.'),

  amountIncomeTax: z.coerce.number({ required_error: 'El monto a aplicar es obligatorio.' })
    .positive('El monto debe ser mayor que cero.')
    .multipleOf(0.01, { message: 'El monto puede tener un máximo de 2 decimales.' }),

  // --- CAMPO TEMPORAL PARA VALIDACIÓN DE NEGOCIO ---
  // Este campo no se envía al backend, solo se usa para la regla .refine()
  _purchaseTotalAmount: z.number().optional(),

}).refine(data => {
  // --- REGLA DE NEGOCIO DEL SERVICIO BACKEND ---
  // El monto de la retención no puede ser mayor al total de la compra.
  // Se necesita el campo `_purchaseTotalAmount` en el formulario para esta validación.
  if (data._purchaseTotalAmount === undefined || data._purchaseTotalAmount === null) {
    return true; // Si no tenemos el total de la compra, no podemos validar.
  }
  return data.amountIncomeTax <= data._purchaseTotalAmount;
}, {
  message: "El monto de la retención no puede ser mayor al total de la compra.",
  path: ["amountIncomeTax"], // Asocia el error al campo del monto.
});


// Esquema para la actualización de una Retención de ISR
export const incomeTaxUpdateSchema = z.object({
  documentNumber: z.string()
    .max(100, 'El número de documento no puede exceder los 100 caracteres.')
    .optional(),

  description: z.string()
    .max(256, 'La descripción no puede exceder los 256 caracteres.')
    .optional(),
  
  issueDate: z.string().optional(),

  amountIncomeTax: z.coerce.number()
    .positive('El monto debe ser mayor que cero.')
    .multipleOf(0.01, { message: 'El monto puede tener un máximo de 2 decimales.' })
    .optional(),
  
  _purchaseTotalAmount: z.number().optional(),

}).refine(data => {
  // La misma validación se aplica en la edición si el monto cambia.
  if (data._purchaseTotalAmount === undefined || data._purchaseTotalAmount === null || data.amountIncomeTax === undefined) {
    return true;
  }
  return data.amountIncomeTax <= data._purchaseTotalAmount;
}, {
  message: "El monto de la retención no puede ser mayor al total de la compra.",
  path: ["amountIncomeTax"],
});