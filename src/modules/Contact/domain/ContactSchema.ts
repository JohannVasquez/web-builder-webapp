import { z } from 'zod';

// Mismo esquema que valida el backend: única fuente de verdad en ambas fronteras.
export const ContactSchema = z.strictObject({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede superar los 100 caracteres'),
  email: z.email('Debe ser un correo electrónico válido').max(255),
  phone: z
    .string()
    .regex(/^\+?[\d\s-]{7,20}$/, 'Debe ser un número de teléfono válido')
    .optional(),
  message: z
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(2000, 'El mensaje no puede superar los 2000 caracteres'),
  // Trampa para bots: se pinta fuera de pantalla y una persona nunca la llena.
  website: z.string().max(0).optional(),
});

export type ContactInput = z.infer<typeof ContactSchema>;

/**
 * Lo que valida el formulario. La casilla de privacidad vive aquí y NO en `ContactSchema`
 * porque ese es el contrato con la API (`strictObject`: un campo de más lo rechaza). El
 * permiso se registra por su propio camino, en el registro de consentimiento.
 */
export const ContactFormSchema = ContactSchema.extend({
  acceptedPrivacy: z.literal(true, {
    message: 'Necesitamos tu autorización para tratar tus datos',
  }),
});

export type ContactFormInput = z.infer<typeof ContactFormSchema>;

// Lo que viaja a la API: el formulario sin la casilla.
export const toContactInput = ({
  acceptedPrivacy: _acceptedPrivacy,
  ...contact
}: ContactFormInput): ContactInput => contact;
