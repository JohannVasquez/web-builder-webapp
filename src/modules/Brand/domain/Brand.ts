import { z } from 'zod';

export const TEXT_SCALES = ['compact', 'normal', 'spacious'] as const;
export const COLOR_MODES = ['light', 'dark', 'system'] as const;

export type TextScale = (typeof TEXT_SCALES)[number];
export type ColorMode = (typeof COLOR_MODES)[number];

// Tolerante a propósito: un dato de marca ausente o raro nunca puede romper el sitio.
export const BrandPaletteSchema = z
  .object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
    background: z.string().optional(),
    foreground: z.string().optional(),
    success: z.string().optional(),
    warning: z.string().optional(),
    danger: z.string().optional(),
  })
  .catch({});

export const BrandTypographySchema = z
  .object({
    pairing: z.string().catch('inter').default('inter'),
    scale: z.enum(TEXT_SCALES).catch('normal').default('normal'),
  })
  .catch({ pairing: 'inter', scale: 'normal' });

export const BrandAssetsSchema = z
  .object({
    logoLight: z.string().optional(),
    logoDark: z.string().optional(),
    favicon: z.string().optional(),
    ogImage: z.string().optional(),
  })
  .catch({});

export const BrandSchema = z.object({
  palette: BrandPaletteSchema.default({}),
  typography: BrandTypographySchema.default({ pairing: 'inter', scale: 'normal' }),
  assets: BrandAssetsSchema.default({}),
  colorMode: z.enum(COLOR_MODES).catch('system').default('system'),
  visualStyle: z.string().catch('classic').default('classic'),
});

export type Brand = z.infer<typeof BrandSchema>;
export type BrandPalette = z.infer<typeof BrandPaletteSchema>;

export const DEFAULT_BRAND: Brand = BrandSchema.parse({});
