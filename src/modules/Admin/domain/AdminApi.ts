import { z } from 'zod';
import { BrandSchema } from '@/modules/Brand/domain/Brand';

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

export const ContactMessageResponseSchema = z.object({ message: ContactMessageSchema });

// GET/PATCH devuelven la marca completa; el backend ya resuelve default y merge por sección.
export const BrandResponseSchema = z.object({ brand: BrandSchema });

export const FontPairingSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
  headingFamily: z.string(),
  bodyFamily: z.string(),
});

export const FontPairingsSchema = z.object({ fontPairings: z.array(FontPairingSchema) });

export const CatalogVisualStyleSchema = z.object({
  id: z.string(),
  label: z.string(),
  description: z.string(),
});

// El catálogo trae bloques y opciones que esta pantalla no usa; `z.object` ignora esas
// claves de más en vez de rechazarlas, así que basta describir la que se lee.
export const CatalogSchema = z.object({ visualStyles: z.array(CatalogVisualStyleSchema) });

export const MediaAssetSchema = z.object({
  key: z.string(),
  mimeType: z.string(),
  size: z.number(),
  originalName: z.string().nullable(),
  alt: z.string().nullable(),
  createdAt: z.string(),
  // Ausente en la respuesta de PATCH (describe): esa acción no vuelve a firmar la URL.
  url: z.string().optional(),
});

export const MediaAssetsSchema = z.object({ assets: z.array(MediaAssetSchema) });

export const MediaAssetResponseSchema = z.object({ asset: MediaAssetSchema });

export const UploadedMediaSchema = z.object({
  key: z.string(),
  url: z.string(),
  mimeType: z.string(),
  size: z.number(),
});

export const UploadMediaResponseSchema = z.object({ asset: UploadedMediaSchema });

export const AssetUsageSchema = z.object({
  kind: z.enum(['page', 'brand', 'settings']),
  label: z.string(),
});

export const DeleteMediaResponseSchema = z.object({ usage: z.array(AssetUsageSchema) });

export const SubscriberSchema = z.object({
  id: z.number(),
  email: z.string(),
  unsubscribedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const SubscribersSchema = z.object({
  subscribers: z.array(SubscriberSchema),
  total: z.number(),
});

export type Tenant = z.infer<typeof TenantSchema>;
export type AdminPage = z.infer<typeof AdminPageSchema>;
export type AdminSection = z.infer<typeof AdminSectionSchema>;
export type ApiKey = z.infer<typeof ApiKeySchema>;
export type ApiKeyStatus = ApiKey['status'];
export type ActivityEntry = z.infer<typeof ActivityEntrySchema>;
export type ContactMessage = z.infer<typeof ContactMessageSchema>;
export type FontPairing = z.infer<typeof FontPairingSchema>;
export type CatalogVisualStyle = z.infer<typeof CatalogVisualStyleSchema>;
export type MediaAsset = z.infer<typeof MediaAssetSchema>;
export type AssetUsage = z.infer<typeof AssetUsageSchema>;
export type Subscriber = z.infer<typeof SubscriberSchema>;
