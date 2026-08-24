import { z } from 'zod';

/**
 * Un canal de contacto (teléfono, WhatsApp, email o el horario de
 * atención) para el panel lateral de `ContactFormSection`. Vive en
 * `domain` (no en el componente cliente que lo consume) porque un
 * Server Component también necesita parsearlo, y los exports de un
 * módulo `'use client'` no cruzan ese límite de forma confiable.
 */
export const ContactChannelSchema = z.object({
  type: z.enum(['phone', 'whatsapp', 'email', 'hours', 'text']),
  title: z.string(),
  description: z.string().optional(),
  /** Número de teléfono, email o texto libre, según `type`. */
  value: z.string().optional(),
  /** Solo `whatsapp`: texto del link (ej. "Iniciar chat"). */
  linkLabel: z.string().optional(),
  /** Solo `hours`: texto fijo (ej. "Siempre disponible"). Con `schedule` no se usa. */
  alwaysOpenLabel: z.string().optional(),
  /** Solo `hours`: horario real por día. Tiene prioridad sobre `alwaysOpenLabel`. */
  schedule: z.array(z.object({ day: z.string(), hours: z.string() })).default([]),
});

export type ContactChannel = z.infer<typeof ContactChannelSchema>;
