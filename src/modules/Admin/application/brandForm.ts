import { contrastRatio, parseHex, WCAG_AA_NORMAL_TEXT } from '@/shared/lib/color';
import type { Brand, BrandPalette } from '@/modules/Brand/domain/Brand';

// Normaliza un hex tecleado a mano: acepta con o sin `#`, 3 o 6 dígitos, cualquier caso.
// Devuelve siempre `#rrggbb` en minúsculas, o `null` si no es un hex válido.
export const normalizeHexInput = (value: string): string | null => {
  const trimmed = value.trim();
  const raw = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(raw)) {
    return null;
  }
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((char) => char + char)
          .join('')
      : raw;
  return `#${full.toLowerCase()}`;
};

export interface ContrastPair {
  readonly key: keyof BrandPalette;
  readonly label: string;
  readonly ratio: number;
}

// Cada color de la paleta que también se usa como texto, enfrentado al fondo elegido.
const TEXT_PAIRS: ReadonlyArray<{ key: keyof BrandPalette; label: string }> = [
  { key: 'foreground', label: 'Texto' },
  { key: 'primary', label: 'Principal' },
  { key: 'secondary', label: 'Secundario' },
  { key: 'accent', label: 'Acento' },
  { key: 'success', label: 'Éxito' },
  { key: 'warning', label: 'Advertencia' },
  { key: 'danger', label: 'Peligro' },
];

// Pares fondo/texto de la paleta que no llegan al 4.5:1 de WCAG AA.
export const findLowContrastPairs = (palette: BrandPalette): readonly ContrastPair[] => {
  const background = palette.background !== undefined ? parseHex(palette.background) : null;
  if (background === null) {
    return [];
  }
  const pairs: ContrastPair[] = [];
  for (const { key, label } of TEXT_PAIRS) {
    const value = palette[key];
    const color = value === undefined ? null : parseHex(value);
    if (color === null) {
      continue;
    }
    const ratio = contrastRatio(color, background);
    if (ratio < WCAG_AA_NORMAL_TEXT) {
      pairs.push({ key, label, ratio });
    }
  }
  return pairs;
};

export interface BrandTypographyDraft {
  readonly pairing: string;
  readonly scale: Brand['typography']['scale'];
}

export interface BrandPatch {
  readonly palette?: BrandPalette;
  readonly typography?: BrandTypographyDraft;
  readonly colorMode?: Brand['colorMode'];
  readonly visualStyle?: string;
}

const PALETTE_KEYS: ReadonlyArray<keyof BrandPalette> = [
  'primary',
  'secondary',
  'accent',
  'background',
  'foreground',
  'success',
  'warning',
  'danger',
];

// Compara campo a campo en vez de por texto: el orden de las claves no debería
// disparar un PATCH cuando los colores son, en realidad, los mismos.
const palettesEqual = (a: BrandPalette, b: BrandPalette): boolean =>
  PALETTE_KEYS.every((key) => (a[key] ?? null) === (b[key] ?? null));

// El backend fusiona por sección y, si se manda `palette`, la reemplaza entera (no la
// combina campo a campo). Por eso comparamos por sección y mandamos el objeto completo.
export const buildBrandPatch = (original: Brand, draft: Brand): BrandPatch => {
  const patch: { -readonly [K in keyof BrandPatch]?: BrandPatch[K] } = {};

  if (!palettesEqual(original.palette, draft.palette)) {
    patch.palette = draft.palette;
  }
  if (
    original.typography.pairing !== draft.typography.pairing ||
    original.typography.scale !== draft.typography.scale
  ) {
    patch.typography = { pairing: draft.typography.pairing, scale: draft.typography.scale };
  }
  if (original.colorMode !== draft.colorMode) {
    patch.colorMode = draft.colorMode;
  }
  if (original.visualStyle !== draft.visualStyle) {
    patch.visualStyle = draft.visualStyle;
  }

  return patch;
};

export const hasBrandChanges = (patch: BrandPatch): boolean => Object.keys(patch).length > 0;
