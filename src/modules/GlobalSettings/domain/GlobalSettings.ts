import { z } from 'zod';
import { BrandSchema, DEFAULT_BRAND } from '@/modules/Brand/domain/Brand';

// No es strict: la API puede agregar campos antes de que el frontend los use.
export const GlobalSettingsSchema = z.object({
  siteName: z.string(),
  tagline: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  whatsappNumber: z.string(),
  address: z.string(),
  instagramUrl: z.string(),
  facebookUrl: z.string(),
  tiktokUrl: z.string().default(''),
  linkedinUrl: z.string().default(''),
  youtubeUrl: z.string().default(''),
  xUrl: z.string().default(''),
  customLinkUrl: z.string().default(''),
  customLinkLabel: z.string().default(''),
  googleAnalyticsId: z.string().default(''),
  metaPixelId: z.string().default(''),
  googleTagManagerId: z.string().default(''),
  cookieBanner: z.string().default(''),
  // Códigos que Search Console y Bing piden pegar en el `<head>` para verificar el dominio.
  googleSiteVerification: z.string().default(''),
  bingSiteVerification: z.string().default(''),
  // 'true' saca del índice el sitio entero mientras se construye.
  siteUnderConstruction: z.string().default(''),
  openingHours: z.string().default(''),
  // Dominio canónico del cliente; puede ser distinto de aquel por el que entró el visitante.
  primaryDomain: z.string().nullable().default(null),
  brand: BrandSchema.default(DEFAULT_BRAND),
  // No viaja en el cuerpo: lo marca el repositorio cuando la API responde con `X-Demo: true`,
  // es decir, cuando el sitio se está sirviendo como demo de prospecto.
  servedAsDemo: z.boolean().optional(),
});

export type GlobalSettings = z.infer<typeof GlobalSettingsSchema>;

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  siteName: 'Web Builder',
  tagline: '',
  contactEmail: '',
  contactPhone: '',
  whatsappNumber: '',
  address: '',
  instagramUrl: '',
  facebookUrl: '',
  tiktokUrl: '',
  linkedinUrl: '',
  youtubeUrl: '',
  xUrl: '',
  customLinkUrl: '',
  customLinkLabel: '',
  googleAnalyticsId: '',
  metaPixelId: '',
  googleTagManagerId: '',
  cookieBanner: '',
  googleSiteVerification: '',
  bingSiteVerification: '',
  siteUnderConstruction: '',
  openingHours: '',
  primaryDomain: null,
  brand: DEFAULT_BRAND,
};

// El ajuste es texto libre (todas las claves de configuración lo son), así que solo el valor
// exacto cuenta: cualquier otra cosa deja el sitio visible, que es el estado normal.
export const isUnderConstruction = (settings: GlobalSettings): boolean =>
  settings.siteUnderConstruction === 'true';

// Una demo de prospecto nunca se indexa (épica DEMO).
export const isServedAsDemo = (settings: GlobalSettings): boolean =>
  settings.servedAsDemo === true;
