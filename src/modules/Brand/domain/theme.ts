import {
  BLACK,
  WHITE,
  darken,
  ensureContrast,
  lighten,
  mix,
  parseHex,
  readableForeground,
  toHex,
  type Rgb,
} from './color';
import type { BrandPalette, TextScale } from './Brand';

// Paleta neutra por defecto: es el aspecto que el sitio ya tenía antes de la identidad de marca.
const NEUTRAL = {
  primary: '#171717',
  secondary: '#f5f5f5',
  accent: '#e5e5e5',
  background: '#ffffff',
  foreground: '#0a0a0a',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
} as const;

const DARK_BACKGROUND = '#0b0b0d';
const DARK_FOREGROUND = '#fafafa';

export type ThemeTokens = Readonly<Record<string, string>>;

export interface BrandTheme {
  readonly light: ThemeTokens;
  readonly dark: ThemeTokens;
}

const read = (value: string | undefined, fallback: string): Rgb => {
  const parsed = value === undefined ? null : parseHex(value);
  return parsed ?? (parseHex(fallback) as Rgb);
};

const buildScheme = (
  palette: BrandPalette,
  background: Rgb,
  isDark: boolean,
): ThemeTokens => {
  // El color de texto elegido por el cliente solo manda en claro: en oscuro lo decide el fondo.
  const text = isDark
    ? read(DARK_FOREGROUND, DARK_FOREGROUND)
    : read(palette.foreground, NEUTRAL.foreground);

  const surfaceShift = isDark ? 0.06 : 0.03;

  // Los colores de marca se guardan intactos: son fondos de botón o tarjeta y el
  // contraste lo aporta su propio `-foreground`. Tocarlos aquí falsearía la marca.
  const primary = read(palette.primary, NEUTRAL.primary);
  const secondary = read(palette.secondary, NEUTRAL.secondary);
  const accent = read(palette.accent, NEUTRAL.accent);
  const success = read(palette.success, NEUTRAL.success);
  const warning = read(palette.warning, NEUTRAL.warning);
  const danger = read(palette.danger, NEUTRAL.danger);

  // Versión ajustada del mismo color para cuando se usa como TEXTO sobre el fondo de la página.
  const asText = (color: Rgb): Rgb => ensureContrast(color, background, 4.5);

  const surface = mix(background, isDark ? WHITE : BLACK, surfaceShift);
  const muted = mix(background, text, isDark ? 0.1 : 0.04);
  const border = mix(background, text, isDark ? 0.16 : 0.12);
  const mutedText = ensureContrast(mix(background, text, 0.55), background, 4.5);

  const soft = (color: Rgb): Rgb => mix(background, color, isDark ? 0.22 : 0.12);
  const strong = (color: Rgb): Rgb =>
    isDark ? lighten(color, 0.12) : darken(color, 0.14);

  // `--secondary` y `--accent` son superficies neutras (fondo de sección, hover del menú),
  // no los colores 2 y 3 de la marca: pintar el pie de página con el índigo del cliente
  // se ve peor, no mejor. Los colores de marca viven en `--brand-*`.
  const neutralSurface = mix(background, text, isDark ? 0.08 : 0.035);
  const neutralHover = mix(background, text, isDark ? 0.12 : 0.06);

  const brandTriple = (name: string, color: Rgb): ThemeTokens => ({
    [`--brand-${name}`]: toHex(color),
    [`--brand-${name}-foreground`]: toHex(readableForeground(color)),
    [`--brand-${name}-soft`]: toHex(soft(color)),
    [`--brand-${name}-strong`]: toHex(strong(color)),
    [`--brand-${name}-text`]: toHex(asText(color)),
  });

  return {
    '--background': toHex(background),
    '--foreground': toHex(text),
    '--card': toHex(surface),
    '--card-foreground': toHex(text),
    '--popover': toHex(surface),
    '--popover-foreground': toHex(text),
    '--primary': toHex(primary),
    '--primary-foreground': toHex(readableForeground(primary)),
    '--secondary': toHex(neutralSurface),
    '--secondary-foreground': toHex(text),
    '--accent': toHex(neutralHover),
    '--accent-foreground': toHex(text),
    ...brandTriple('primary', primary),
    ...brandTriple('secondary', secondary),
    ...brandTriple('accent', accent),
    '--muted': toHex(muted),
    '--muted-foreground': toHex(mutedText),
    '--border': toHex(border),
    '--input': toHex(border),
    '--ring': toHex(primary),
    '--brand-success': toHex(success),
    '--brand-success-foreground': toHex(readableForeground(success)),
    '--brand-warning': toHex(warning),
    '--brand-warning-foreground': toHex(readableForeground(warning)),
    '--destructive': toHex(danger),
    '--brand-danger-foreground': toHex(readableForeground(danger)),
    '--brand-overlay': isDark ? 'rgba(0, 0, 0, 0.62)' : 'rgba(10, 12, 24, 0.55)',
  };
};

const TEXT_SCALE_ROOT: Readonly<Record<TextScale, string>> = {
  compact: '0.9375',
  normal: '1',
  spacious: '1.0625',
};

const SECTION_SPACING: Readonly<Record<TextScale, string>> = {
  compact: '0.85',
  normal: '1',
  spacious: '1.2',
};

export const resolveBrandTheme = (palette: BrandPalette): BrandTheme => ({
  light: buildScheme(palette, read(palette.background, NEUTRAL.background), false),
  dark: buildScheme(palette, read(DARK_BACKGROUND, DARK_BACKGROUND), true),
});

export const textScaleTokens = (scale: TextScale): ThemeTokens => ({
  '--brand-text-scale': TEXT_SCALE_ROOT[scale],
  '--brand-section-spacing': SECTION_SPACING[scale],
});
