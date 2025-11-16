// src/schemas/supplierSchema.js

import { z } from 'zod';

// 1. Definimos la base con los campos comunes a ambos tipos de persona (Natural/Jurídica).
//    Las validaciones (min, max, email, etc.) son una traducción directa de las
//    anotaciones @NotBlank, @Size, @Email del DTO de Spring Boot.
const baseSupplierSchema = z.object({
  supplierName: z.string().min(1, 'El nombre es obligatorio').max(100, 'El nombre puede tener máximo 100 caracteres'),
  nrc: z.string().min(1, 'El NRC es obligatorio').max(14, 'El NRC puede tener máximo 14 caracteres'),
  address: z.string().min(1, 'La dirección es obligatoria').max(50, 'La dirección puede tener máximo 50 caracteres'),
  email: z.string().min(1, 'El correo es obligatorio').email('El formato del correo es inválido').max(30, 'El correo puede tener máximo 30 caracteres'),
  phone: z.string().length(8, 'El teléfono debe tener 8 dígitos.'),
  creditDay: z.coerce.number({ invalid_type_error: 'Debe ser un número' }).min(0, 'Los días de crédito no pueden ser negativos'),
  creditLimit: z.coerce.number({ invalid_type_error: 'Debe ser un número' }).min(0, 'El límite de crédito no puede ser negativo'),
  businessActivity: z.string().min(1, 'La actividad económica es obligatoria').max(100, 'La actividad económica puede tener máximo 100 caracteres'),
  
  // Para los booleanos, usamos preprocess para convertirlos desde el string "true"/"false" del radio button.
  exemptFromVat: z.preprocess((val) => String(val) === 'true', z.boolean()),
  appliesPerception: z.preprocess((val) => String(val) === 'true', z.boolean()),
  
  // Este campo es opcional en el backend, por lo que lo hacemos opcional aquí también.
  supplierType: z.string().max(20, 'El tipo de proveedor puede tener máximo 20 caracteres').optional(),
});

// 2. Esquema para Persona NATURAL. Extiende la base y añade sus campos específicos.
const naturalPersonSchema = baseSupplierSchema.extend({
  personType: z.literal('NATURAL'),
  supplierLastName: z.string().min(1, 'El apellido es requerido').max(100, 'El apellido puede tener máximo 100 caracteres'),
  // Usamos regex para asegurar el formato con guion, mejorando la UX al usar máscaras.
  supplierDui: z.string().regex(/^\d{8}-\d$/, 'El formato del DUI es ########-#'),
  // Hacemos nulos los campos que no aplican para este tipo, reflejando la lógica del backend.
  supplierNit: z.null().or(z.literal('')).optional(),
});

// 3. Esquema para Persona JURÍDICA.
const juridicalPersonSchema = baseSupplierSchema.extend({
  personType: z.literal('JURIDICA'),
  supplierNit: z.string().regex(/^\d{4}-\d{6}-\d{3}-\d{1}$/, 'El formato del NIT es ####-######-###-#'),
  // Hacemos nulos los campos que no aplican.
  supplierDui: z.null().or(z.literal('')).optional(),
  supplierLastName: z.null().or(z.literal('')).optional(),
});


// 4. EL ÚNICO ESQUEMA QUE SE EXPORTA.
//    Zod usará el campo 'personType' para decidir dinámicamente qué
//    conjunto de reglas de validación aplicar al objeto completo del formulario.
export const supplierSchema = z.discriminatedUnion('personType', [
  naturalPersonSchema,
  juridicalPersonSchema,
]);