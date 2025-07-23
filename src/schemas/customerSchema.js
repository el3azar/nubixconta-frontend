import { z } from 'zod';

// Base para campos comunes que aplican tanto a la creación como a la edición
const baseCustomerSchema = z.object({
  customerName: z.string().min(1, 'El nombre es requerido').max(50),
  ncr: z.string().min(1, 'El NRC es requerido').max(14),
  address: z.string().min(1, 'La dirección es requerida').max(50),
  email: z.string().email('El formato del correo es inválido').max(30),
  phone: z.string().length(8, 'El teléfono debe tener 8 dígitos.'),
  creditDay: z.coerce.number({ invalid_type_error: 'Debe ser un número' }).min(0, 'No pueden ser días negativos'),
  creditLimit: z.coerce.number({ invalid_type_error: 'Debe ser un número' }).min(0, 'No puede ser un límite negativo'),
  businessActivity: z.string().min(1, 'La actividad comercial es requerida').max(100),
  // Para los booleanos, los convertimos desde el string del radio button
  exemptFromVat: z.preprocess((val) => String(val) === 'true', z.boolean()),
  appliesWithholding: z.preprocess((val) => String(val) === 'true', z.boolean()),
  // Hacemos el status opcional ya que no siempre estará en los datos del formulario,
  // pero puede venir en los datos del backend para la edición.
  status: z.boolean().optional(),
});

// Esquema para Persona NATURAL
const naturalPersonSchema = baseCustomerSchema.extend({
  personType: z.literal('NATURAL'),
  customerLastName: z.string().min(1, 'El apellido es requerido').max(50),
  customerDui: z.string().regex(/^\d{8}-\d$/, 'El formato del DUI es ########-#'),
  // Hacemos nulos los campos que no aplican
  customerNit: z.null().or(z.literal('')).optional(),
});

// Esquema para Persona JURIDICA
const juridicalPersonSchema = baseCustomerSchema.extend({
  personType: z.literal('JURIDICA'),
  customerNit: z.string().min(1, 'El NIT es requerido').max(17),
  // Hacemos nulos los campos que no aplican
  customerDui: z.null().or(z.literal('')).optional(),
  customerLastName: z.null().or(z.literal('')).optional(),
});


// --- EL ÚNICO ESQUEMA QUE NECESITAS EXPORTAR ---
// Lo usaremos tanto para CREAR como para EDITAR, porque en ambos casos
// el objeto del formulario está completo y debe seguir las mismas reglas.
export const customerSchema = z.discriminatedUnion('personType', [
  naturalPersonSchema,
  juridicalPersonSchema,
]);