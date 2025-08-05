import { z } from 'zod';

/**
 * Esquema de validación para una línea de detalle de la Nota de Crédito.
 * Valida los datos que el usuario puede editar en el formulario.
 */
const creditNoteDetailSchema = z.object({
  // Identificadores que no se envían pero necesitamos para la UI
  saleDetailId: z.number().optional(), 
  productId: z.number().nullable(),
  serviceName: z.string().nullable(),
  
  // Campos editables con validaciones estrictas
  quantity: z.number({ invalid_type_error: 'La cantidad es obligatoria.' })
    .min(1, 'La cantidad debe ser al menos 1.'),
  
  unitPrice: z.number({ invalid_type_error: 'El precio es obligatorio.' })
    .min(0, 'El precio no puede ser negativo.'),
    
  subtotal: z.number(), // Calculado, pero lo mantenemos para consistencia
  
  impuesto: z.boolean(), // El checkbox del impuesto
  
  // Permitimos campos extra que vienen de la venta original para que Zod no los rechace
}).passthrough(); 

/**
 * Esquema principal para el formulario de Nota de Crédito.
 * Se encarga de validar la estructura completa que se enviará a la API.
 */
export const creditNoteSchema = z.object({
  documentNumber: z.string()
    .min(1, 'El número de documento es obligatorio.')
    .max(20, 'El número de documento no puede exceder los 20 caracteres.'),
  
    // --- INICIO DE LA CORRECCIÓN ---
  // Hacemos que la descripción sea obligatoria, como en el backend.
  description: z.string()
    .min(1, 'La descripción es obligatoria.')
    .max(255, 'La descripción no puede exceder los 255 caracteres.'),
  // --- FIN DE LA CORRECCIÓN ---

  // Se añade la validación para la fecha de emisión, que ahora es requerida.
  issueDate: z.string().min(1, 'La fecha es obligatoria'),

  saleId: z.number()
    .min(1, 'Error: El ID de la venta asociada se ha perdido.'),

  // Los campos de totales son calculados, pero los validamos
  subtotalAmount: z.number(),
  vatAmount: z.number(),
  totalAmount: z.number(),
  
  // El array de detalles debe tener al menos un ítem
  details: z.array(creditNoteDetailSchema)
    .min(1, 'La nota de crédito debe contener al menos un ítem.'),
});