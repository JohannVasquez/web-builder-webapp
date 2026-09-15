import { z } from 'zod';

export const AdminUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string(),
  name: z.string(),
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

export const SessionSchema = z.object({
  token: z.string().min(1),
  user: AdminUserSchema,
});

export type Session = z.infer<typeof SessionSchema>;

// Distingue "sesión caducada" de "fallo del servidor": uploader y panel
// muestran mensajes distintos porque cada caso se arregla de forma distinta.
export class SessionExpiredError extends Error {
  constructor() {
    super('Tu sesión caducó. Vuelve a iniciar sesión para continuar.');
    this.name = 'SessionExpiredError';
  }
}
