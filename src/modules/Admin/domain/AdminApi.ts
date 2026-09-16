import { z } from 'zod';

export const TenantSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string(),
  name: z.string(),
  primaryDomain: z.string().nullable(),
});

export const TenantsSchema = z.object({ tenants: z.array(TenantSchema) });

export const AdminSectionSchema = z.object({
  id: z.number().int().positive(),
  type: z.string(),
  position: z.number().int(),
  props: z.record(z.string(), z.unknown()),
  anchor: z.string().nullable(),
});

export const AdminPageSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  isPublished: z.boolean(),
  sections: z.array(AdminSectionSchema),
});

export const AdminPagesSchema = z.object({ pages: z.array(AdminPageSchema) });

// Respuesta de crear/actualizar/borrar página y de cada operación sobre sus secciones:
// el backend siempre devuelve la página completa ya actualizada.
export const AdminPageResponseSchema = z.object({ page: AdminPageSchema });

export const ApiKeySchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  prefix: z.string(),
  permission: z.enum(['read', 'write', 'full']),
  scopeAllTenants: z.boolean(),
  tenantIds: z.array(z.number()),
  rateLimitPerMinute: z.number(),
  expiresAt: z.string().nullable(),
  lastUsedAt: z.string().nullable(),
  revokedAt: z.string().nullable(),
  createdAt: z.string(),
  status: z.enum(['active', 'revoked', 'expired']),
});

export const ApiKeysSchema = z.object({ apiKeys: z.array(ApiKeySchema) });

export const CreatedApiKeySchema = z.object({
  apiKey: ApiKeySchema,
  token: z.string(),
  warning: z.string(),
});

export const ActivityEntrySchema = z.object({
  id: z.number(),
  tenantId: z.number().nullable(),
  actorType: z.enum(['admin', 'apiKey']),
  actorName: z.string(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().nullable(),
  summary: z.string(),
  createdAt: z.string(),
});

export const ActivitySchema = z.object({
  entries: z.array(ActivityEntrySchema),
  total: z.number(),
});

export const ContactMessageSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  message: z.string(),
  emailedAt: z.string().nullable(),
  emailError: z.string().nullable(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
});

export const ContactMessagesSchema = z.object({
  messages: z.array(ContactMessageSchema),
  total: z.number(),
});

export type Tenant = z.infer<typeof TenantSchema>;
export type AdminPage = z.infer<typeof AdminPageSchema>;
export type AdminSection = z.infer<typeof AdminSectionSchema>;
export type ApiKey = z.infer<typeof ApiKeySchema>;
export type ApiKeyStatus = ApiKey['status'];
export type ActivityEntry = z.infer<typeof ActivityEntrySchema>;
export type ContactMessage = z.infer<typeof ContactMessageSchema>;
