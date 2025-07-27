import { z } from 'zod';

// Esquema para un único detalle de venta (cada fila de la tabla)
const saleDetailSchema = z.object({
  // Campos del DTO que se envían al backend
  productId: z.number().int().positive().nullable(),
  serviceName: z.string().max(50, 'Máximo 50 caracteres').nullable(),
  quantity: z.coerce.number().int('Debe ser un número entero').min(1, 'La cantidad debe ser al menos 1'),
  unitPrice: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  subtotal: z.coerce.number(),
  
  // Campo TEMPORAL solo para cálculos en el frontend (no se envía)
  impuesto: z.boolean(), 

}).refine(data => {
  // Regla: Debe tener productId O serviceName, pero no ambos.
  const hasProduct = data.productId !== null;
  const hasService = !!data.serviceName && data.serviceName.trim() !== '';
  return (hasProduct && !hasService) || (!hasProduct && hasService);
}, {
  message: "Cada detalle debe ser un producto o un servicio, no ambos.",
  path: ["productId"], 
});

// Esquema principal para toda la venta
export const saleSchema = z.object({
  // Cabecera de la Venta (traducido de SaleCreateDTO)
  clientId: z.number().int().positive({ message: 'El cliente es inválido.'}),
  documentNumber: z.string().min(1, 'El número de documento es obligatorio').max(20),
  issueDate: z.string().min(1, 'La fecha es obligatoria'),
  saleDescription: z.string().min(1, 'La descripción es obligatoria').max(255),
  moduleType: z.string().min(1, 'El módulo es obligatorio'),

  // Campos Calculados
  subtotalAmount: z.coerce.number(),
  vatAmount: z.coerce.number(),
  totalAmount: z.coerce.number(),

  // Detalles de la Venta
  saleDetails: z.array(saleDetailSchema).min(1, 'La venta debe tener al menos un producto o servicio.'),
});