import { mix, parseHex, toHex, type Rgb } from '@/shared/lib/color';

// Nombres de token CSS, ej. "--background"; los valores viven en un mapa ya resuelto a hex.
export type CssVars = Readonly<Record<string, string>>;

const COLOR_MIX_PATTERN = /^color-mix\(in srgb,\s*(.+)\)$/;
const VAR_PATTERN = /^var\((--[\w-]+)\)$/;
const HEX_PATTERN = /^#[0-9a-fA-F]{3,8}$/;
const OPERAND_PATTERN = /^(.+?)\s+(\d+(?:\.\d+)?)%$/;

interface Operand {
  readonly token: string;
  readonly percent: number | undefined;
}

const parseOperand = (raw: string): Operand => {
  const match = OPERAND_PATTERN.exec(raw.trim());
  if (match === null) {
    return { token: raw.trim(), percent: undefined };
  }
  return { token: match[1].trim(), percent: Number(match[2]) };
};

// Resuelve un valor de token de estilo (posible `var()`, `color-mix()` o `transparent`) al
// hex final, dado el mapa de variables ya resueltas (tema de marca + tokens del estilo). Es la
// única aproximación no exacta: `transparent` se trata como si compusiera sobre `--background`,
// que es lo que pasa en el layout normal, pero no modela un `backdrop-filter` con contenido
// detrás distinto (glassmorphism, aurora): ver Spec 6.3 en el reporte para el detalle.
export const resolveToken = (value: string, vars: CssVars): string | null => {
  const trimmed = value.trim();
  if (trimmed === 'transparent') {
    return vars['--background'] ?? null;
  }
  if (HEX_PATTERN.test(trimmed)) {
    return trimmed;
  }
  const varMatch = VAR_PATTERN.exec(trimmed);
  if (varMatch) {
    const referenced = vars[varMatch[1]];
    return referenced === undefined ? null : resolveToken(referenced, vars);
  }
  const mixMatch = COLOR_MIX_PATTERN.exec(trimmed);
  if (mixMatch === null) {
    return null;
  }
  const [rawA, rawB] = mixMatch[1].split(',');
  if (rawA === undefined || rawB === undefined) {
    return null;
  }
  const a = parseOperand(rawA);
  const b = parseOperand(rawB);
  const hexA = resolveToken(a.token, vars);
  const hexB = resolveToken(b.token, vars);
  if (hexA === null || hexB === null) {
    return null;
  }
  const rgbA = parseHex(hexA);
  const rgbB = parseHex(hexB);
  if (rgbA === null || rgbB === null) {
    return null;
  }
  const weightA = a.percent ?? (b.percent === undefined ? 50 : 100 - b.percent);
  return toHex(mix(rgbB, rgbA, weightA / 100));
};

export const resolveTokenRgb = (value: string, vars: CssVars): Rgb | null => {
  const hex = resolveToken(value, vars);
  return hex === null ? null : parseHex(hex);
};
