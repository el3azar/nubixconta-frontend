import { z } from 'zod';

// Esquema para una línea individual de la transacción
const entrySchema = z.object({
  catalogId: z.number().int().positive('Debe seleccionar una cuenta contable.'),
  debit: z.coerce.number().min(0, 'El Debe no puede ser negativo.'),
  credit: z.coerce.number().min(0, 'El Haber no puede ser negativo.'),
  // Campos temporales para la UI
  _accountCode: z.string(),
  _accountName: z.string(),
}).refine(data => data.debit > 0 || data.credit > 0, {
  message: "Cada línea debe tener un valor en el Debe o en el Haber.",
  path: ["debit"],
}).refine(data => !(data.debit > 0 && data.credit > 0), {
  message: "Una línea no puede tener valores en Debe y Haber simultáneamente.",
  path: ["credit"],
});

// Esquema principal para la transacción contable
export const accountingTransactionSchema = z.object({
  transactionDate: z.string().min(1, 'La fecha de la transacción es obligatoria.'),
  description: z.string().min(1, 'El concepto o descripción es obligatorio.').max(255, 'La descripción no puede exceder 255 caracteres.'),
  entries: z.array(entrySchema).min(2, 'La transacción debe tener al menos dos líneas.'),
});