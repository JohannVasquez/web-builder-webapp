import { z } from 'zod';

export const ADMIN_ROLES = ['owner', 'editor'] as const;

export const AdminRoleSchema = z.enum(ADMIN_ROLES);

export type AdminRole = z.infer<typeof AdminRoleSchema>;

export const AdminUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string(),
  name: z.string(),
  role: AdminRoleSchema,
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

export const SessionSchema = z.object({
  token: z.string().min(1),
  user: AdminUserSchema,
});

export type Session = z.infer<typeof SessionSchema>;

// `/api/admin/me` no devuelve `email`: esquema propio en vez de `SessionSchema.shape.user`.
export const MeUserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  role: AdminRoleSchema,
});

export type MeUser = z.infer<typeof MeUserSchema>;

// Distingue "sesión caducada" de "fallo del servidor": uploader y panel
// muestran mensajes distintos porque cada caso se arregla de forma distinta.
export class SessionExpiredError extends Error {
  constructor() {
    super('Tu sesión caducó. Vuelve a iniciar sesión para continuar.');
    this.name = 'SessionExpiredError';
  }
}
