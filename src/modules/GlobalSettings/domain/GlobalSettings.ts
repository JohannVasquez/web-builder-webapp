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
  brand: DEFAULT_BRAND,
};
