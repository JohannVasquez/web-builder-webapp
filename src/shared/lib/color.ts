export interface Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;
}

const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const isHexColor = (value: string): boolean => HEX_PATTERN.test(value);

export const parseHex = (hex: string): Rgb | null => {
  if (!isHexColor(hex)) {
    return null;
  }
  const raw = hex.slice(1);
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map((char) => char + char)
          .join('')
      : raw;
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
  };
};

const clampChannel = (value: number): number =>
  Math.max(0, Math.min(255, Math.round(value)));

export const toHex = ({ r, g, b }: Rgb): string =>
  `#${[r, g, b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, '0'))
    .join('')}`;

// Luminancia relativa de la WCAG: canales linealizados y ponderados por sensibilidad del ojo.
export const relativeLuminance = ({ r, g, b }: Rgb): number => {
  const linear = [r, g, b].map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.03928
      ? normalized / 12.92
      : Math.pow((normalized + 0.055) / 1.055, 2.4);
  });
  return (
    0.2126 * (linear[0] ?? 0) + 0.7152 * (linear[1] ?? 0) + 0.0722 * (linear[2] ?? 0)
  );
};

export const contrastRatio = (a: Rgb, b: Rgb): number => {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort(
    (x, y) => y - x,
  );
  return ((lighter ?? 0) + 0.05) / ((darker ?? 0) + 0.05);
};

export const mix = (from: Rgb, to: Rgb, amount: number): Rgb => {
  const weight = Math.max(0, Math.min(1, amount));
  return {
    r: from.r + (to.r - from.r) * weight,
    g: from.g + (to.g - from.g) * weight,
    b: from.b + (to.b - from.b) * weight,
  };
};

export const WHITE: Rgb = { r: 255, g: 255, b: 255 };
export const BLACK: Rgb = { r: 0, g: 0, b: 0 };

export const lighten = (color: Rgb, amount: number): Rgb => mix(color, WHITE, amount);
export const darken = (color: Rgb, amount: number): Rgb => mix(color, BLACK, amount);

export const WCAG_AA_NORMAL_TEXT = 4.5;

// Elegir el mejor entre blanco y negro siempre supera 4.5:1, para cualquier fondo.
export const readableForeground = (background: Rgb): Rgb => {
  const onWhite = contrastRatio(background, WHITE);
  const onBlack = contrastRatio(background, BLACK);
  return onWhite >= onBlack ? WHITE : BLACK;
};

// Acerca `color` a blanco o negro hasta que despegue del fondo lo suficiente para leerse.
export const ensureContrast = (
  color: Rgb,
  background: Rgb,
  minRatio = WCAG_AA_NORMAL_TEXT,
): Rgb => {
  if (contrastRatio(color, background) >= minRatio) {
    return color;
  }
  const target = relativeLuminance(background) > 0.5 ? BLACK : WHITE;
  let candidate = color;
  for (let step = 1; step <= 20; step += 1) {
    candidate = mix(color, target, step / 20);
    if (contrastRatio(candidate, background) >= minRatio) {
      return candidate;
    }
  }
  return target;
};
