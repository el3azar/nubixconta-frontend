import { z } from 'zod';

// Esquema para la creación de un movimiento manual
export const manualMovementSchema = z.object({
  // El selector nos dará un objeto { value, label }, así que validamos el objeto
  // y luego lo transformamos para enviar solo el 'value' (productId)
  productId: z
    .object({
      value: z.number({ required_error: "Debe seleccionar un producto." }),
      label: z.string()
    })
    .transform(item => item.value),

  movementType: z
    .object({
      value: z.enum(['ENTRADA', 'SALIDA'], { required_error: "Debe seleccionar un tipo." }),
      label: z.string()
    })
    .transform(item => item.value),
    
  quantity: z
    .coerce // Convierte el string del input a número
    .number({ invalid_type_error: "La cantidad debe ser un número." })
    .positive("La cantidad debe ser un número positivo."),
    
  description: z
    .string()
    .min(1, "La descripción es obligatoria.")
    .max(256, "La descripción no puede exceder los 256 caracteres."),
});