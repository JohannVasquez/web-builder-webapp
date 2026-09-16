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
  // Dominio canónico del cliente; puede ser distinto de aquel por el que entró el visitante.
  primaryDomain: z.string().nullable().default(null),
  brand: BrandSchema.default(DEFAULT_BRAND),
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
  primaryDomain: null,
  brand: DEFAULT_BRAND,
};
