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

/**
 * Error que distingue "tu sesión caducó" de "el servidor falló". El uploader
 * y el panel muestran mensajes distintos para cada caso: la primera se
 * arregla volviendo a entrar, la segunda no.
 */
export class SessionExpiredError extends Error {
  constructor() {
    super('Tu sesión caducó. Vuelve a iniciar sesión para continuar.');
    this.name = 'SessionExpiredError';
  }
}
