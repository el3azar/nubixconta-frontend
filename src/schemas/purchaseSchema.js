import { z } from 'zod';

// Esquema para un único detalle de compra (cada fila en la tabla de detalles).
// Basado en PurchaseDetailCreateDTO.java
const purchaseDetailSchema = z.object({
  // Campos del DTO que se envían al backend
  productId: z.number().int().positive().nullable(),
  catalogId: z.number().int().positive().nullable(), // <-- La nueva clave para gastos
  lineDescription: z.string().max(255, "La descripción no puede exceder los 255 caracteres").nullable().optional(),
  quantity: z.coerce.number().int('Debe ser un número entero').min(1, 'La cantidad debe ser al menos 1'),
  unitPrice: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  subtotal: z.coerce.number(),
  
  // Campo TEMPORAL solo para cálculos en el frontend (similar a 'impuesto' en ventas)
  tax: z.boolean(),

  // No necesitamos 'lineDescription' aquí porque el nombre del producto/cuenta se manejará
  // a través de los datos de la búsqueda, similar a como haces con `_productName`.

}).refine(data => {
  // REGLA DE NEGOCIO CLAVE: Debe tener productId O catalogId, pero no ambos.
  const hasProduct = data.productId !== null;
  const hasCatalog = data.catalogId !== null;
  return (hasProduct && !hasCatalog) || (!hasProduct && hasCatalog);
}, {
  message: "Cada línea debe ser un producto o un gasto contable, no ambos.",
  path: ["productId"], // Asocia el error al primer campo del par.
});

// Esquema principal para toda la Compra.
// Basado en PurchaseCreateDTO.java
export const purchaseSchema = z.object({
  // Cabecera de la Compra
  supplierId: z.number().int().positive({ message: 'Debe seleccionar un proveedor válido.'}),
  documentNumber: z.string().min(1, 'El número de documento es obligatorio').max(20, 'El número de documento no puede exceder los 20 caracteres'),
  issueDate: z.string().min(1, 'La fecha de emisión es obligatoria'),
  purchaseDescription: z.string().min(1, 'La descripción es obligatoria').max(255, 'La descripción no puede exceder los 255 caracteres'),
  moduleType: z.string().min(1, 'El tipo de módulo es obligatorio'),

  // Campos calculados en el frontend que se envían al backend
  subtotalAmount: z.coerce.number(),
  vatAmount: z.coerce.number(),
  totalAmount: z.coerce.number(),

  // Array de detalles de la compra
  purchaseDetails: z.array(purchaseDetailSchema).min(1, 'La compra debe tener al menos una línea de detalle.'),
});