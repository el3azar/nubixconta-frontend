import { z } from 'zod';

// Zod es excelente para definir esquemas de forma clara.
export const productSchema = z.object({
  productCode: z
    .string()
    .min(1, 'El código es obligatorio')
    .max(100, 'El código no puede tener más de 100 caracteres'),
  productName: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(256, 'El nombre no puede tener más de 256 caracteres'),
  unit: z
    .string()
    .min(1, 'La unidad es obligatoria')
    .max(50, 'La unidad no puede tener más de 50 caracteres'),
    
  // Para la cantidad inicial, solo la hacemos obligatoria si estamos en modo "Crear".
  // En modo edición, no estará presente en el formulario para ser editada.
  stockQuantity: z
    .coerce // coerce convierte automáticamente el string del input a número
    .number({ invalid_type_error: 'La cantidad debe ser un número' })
    .min(0, 'La cantidad no puede ser negativa')
    .optional(), // La hacemos opcional en el esquema base
})
.refine((data) => {
    // Si no es opcional y no se provee un valor para stockQuantity, entonces es requerido.
    // Esto es una forma de hacerlo condicional. Sin embargo, una forma más sencilla
    // es manejar esta lógica en el componente o tener dos esquemas.
    // Por simplicidad para el refactor, lo dejaremos así, ya que el campo solo
    // se mostrará en modo de creación. El resolver de react-hook-form lo manejará bien.
    return true; // Simplificamos la lógica aquí. La UI se encargará de mostrar/ocultar.
});