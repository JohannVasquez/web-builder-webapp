import { z } from 'zod';

export const GlobalSettingsSchema = z.strictObject({
  siteName: z.string(),
  tagline: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  whatsappNumber: z.string(),
  address: z.string(),
  instagramUrl: z.string(),
  facebookUrl: z.string(),
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
};
