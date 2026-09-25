import { z } from 'zod';
import { BrandSchema } from '@/modules/Brand/domain/Brand';
import { AdminRoleSchema } from '@/modules/Auth/domain/Session';

// Mismos tres valores que `TENANT_STATUSES` en el backend (SPEC 9.3): pausar no borra
// nada y reactivar deja el sitio tal cual estaba.
export const TENANT_STATUSES = ['active', 'paused', 'building'] as const;
export const TenantStatusSchema = z.enum(TENANT_STATUSES);

export const TenantSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  primaryDomain: z.string().nullable(),
  status: TenantStatusSchema,
});

export const TenantsSchema = z.object({ tenants: z.array(TenantSchema) });

export const TenantResponseSchema = z.object({ tenant: TenantSchema });

// Kit de inicio por rubro (SPEC 9.3): lo que trae un cliente nuevo antes de personalizarlo.
export const SiteTemplateSchema = z.object({
  id: z.string(),
  label: z.string(),
  industry: z.string(),
  description: z.string(),
  pageCount: z.number(),
  visualStyle: z.string(),
});

export const SiteTemplatesSchema = z.object({ templates: z.array(SiteTemplateSchema) });

export const DomainInstructionSchema = z.object({
  type: z.string(),
  host: z.string(),
  value: z.string(),
  purpose: z.string(),
});

const TenantDomainBaseSchema = z.object({
  id: z.string(),
  domain: z.string(),
  isPrimary: z.boolean(),
  isVerified: z.boolean(),
  verifiedAt: z.string().nullable(),
});

// El listado trae las instrucciones DNS de cada dominio; crear uno también las devuelve,
// pero fuera del objeto del dominio (ver `AddDomainResponseSchema`).
export const TenantDomainSchema = TenantDomainBaseSchema.extend({
  instructions: z.array(DomainInstructionSchema),
});

export const TenantDomainsSchema = z.object({ domains: z.array(TenantDomainSchema) });

export const DomainResponseSchema = z.object({ domain: TenantDomainBaseSchema });

export const AddDomainResponseSchema = z.object({
  domain: TenantDomainBaseSchema,
  instructions: z.array(DomainInstructionSchema),
});

export const AdminSectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.number().int(),
  props: z.record(z.string(), z.unknown()),
  anchor: z.string().nullable(),
  isHidden: z.boolean(),
});

export const AdminPageSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  isPublished: z.boolean(),
  // Estilo propio de la página; nulo = hereda el del sitio.
  visualStyle: z.string().nullable().default(null),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  ogImageKey: z.string().nullable().optional(),
  noindex: z.boolean().optional(),
  sections: z.array(AdminSectionSchema),
});

export const AdminPagesSchema = z.object({ pages: z.array(AdminPageSchema) });

// Respuesta de crear/actualizar/borrar página y de cada operación sobre sus secciones:
// el backend siempre devuelve la página completa ya actualizada.
export const AdminPageResponseSchema = z.object({ page: AdminPageSchema });

// Historial del borrador: cada cambio guarda una foto antes de aplicarse (SPEC 9.4).
export const PageVersionSchema = z.object({
  id: z.string(),
  summary: z.string(),
  actorType: z.string(),
  actorName: z.string(),
  published: z.boolean(),
  createdAt: z.string(),
});

export const PageVersionsSchema = z.object({ versions: z.array(PageVersionSchema) });

export const ApiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  prefix: z.string(),
  permission: z.enum(['read', 'write', 'full']),
  scopeAllTenants: z.boolean(),
  tenantIds: z.array(z.string()),
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
  id: z.string(),
  tenantId: z.string().nullable(),
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
  id: z.string(),
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
export const CatalogSchema = z.object({
  visualStyles: z.array(CatalogVisualStyleSchema),
});

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
  id: z.string(),
  email: z.string(),
  unsubscribedAt: z.string().nullable(),
  createdAt: z.string(),
});

// Cuentas del panel (SPEC 9.2): distinta de `AdminUser` en el módulo Auth, que describe
// a quien inició sesión, no a cualquier fila de la lista de personas con acceso.
export const UserAccountSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: AdminRoleSchema,
  disabled: z.boolean(),
  // `null` = alcanza a todos los clientes. Solo el rol `client` trae una lista.
  tenantScope: z.array(z.string()).nullable(),
});

export const UserAccountsSchema = z.object({ users: z.array(UserAccountSchema) });

export const UserAccountResponseSchema = z.object({ user: UserAccountSchema });

// Menú de navegación del sitio del cliente (SPEC 9.4): el orden del arreglo es el orden
// del menú, así que se reemplaza entero en vez de tener id por enlace.
export const NavigationLinkSchema = z.object({
  label: z.string(),
  href: z.string(),
});

export const NavigationLinksSchema = z.object({
  links: z.array(NavigationLinkSchema),
});

export const SubscribersSchema = z.object({
  subscribers: z.array(SubscriberSchema),
  total: z.number(),
});

export type Tenant = z.infer<typeof TenantSchema>;
export type TenantStatus = z.infer<typeof TenantStatusSchema>;
export type SiteTemplate = z.infer<typeof SiteTemplateSchema>;
export type DomainInstruction = z.infer<typeof DomainInstructionSchema>;
export type TenantDomain = z.infer<typeof TenantDomainSchema>;
export type AdminPage = z.infer<typeof AdminPageSchema>;
export type AdminSection = z.infer<typeof AdminSectionSchema>;
export type PageVersion = z.infer<typeof PageVersionSchema>;
export type ApiKey = z.infer<typeof ApiKeySchema>;
export type ApiKeyStatus = ApiKey['status'];
export type ActivityEntry = z.infer<typeof ActivityEntrySchema>;
export type ContactMessage = z.infer<typeof ContactMessageSchema>;
export type FontPairing = z.infer<typeof FontPairingSchema>;
export type CatalogVisualStyle = z.infer<typeof CatalogVisualStyleSchema>;
export type MediaAsset = z.infer<typeof MediaAssetSchema>;
export type AssetUsage = z.infer<typeof AssetUsageSchema>;
export type Subscriber = z.infer<typeof SubscriberSchema>;
export type UserAccount = z.infer<typeof UserAccountSchema>;
export type NavigationLink = z.infer<typeof NavigationLinkSchema>;
