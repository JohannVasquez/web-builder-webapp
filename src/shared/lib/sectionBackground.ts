import type { CSSProperties } from 'react';
import { z } from 'zod';
import { mix, parseHex, readableForeground, toHex, ensureContrast } from './color';

/**
 * Fragmento de schema común para el fondo de un `<section>` completo.
 * Cada sección lo mezcla en su propio schema con `...SectionBackgroundPropsSchema.shape`
 * en vez de declarar `backgroundColor` a mano, para que agregar imagen de
 * fondo a un tipo de sección nuevo sea mecánico y consistente en todo el
 * motor — no una capacidad exclusiva de `Hero`.
 */
export const SectionBackgroundPropsSchema = z.object({
  /** Color CSS de fondo de toda la sección (viene de la BD). */
  backgroundColor: z.string().optional(),
  /**
   * URL absoluta (bucket del módulo FileStorage) usada como fondo de TODA
   * la sección. No es lo mismo que una `imageUrl` propia del contenido
   * (ej. la foto lateral de `TextBlock`/`SplitHighlights`): esa decora una
   * parte del layout, esta cubre el `<section>` entero y tiene prioridad
   * sobre `backgroundColor` cuando ambas vienen.
   */
  backgroundImageUrl: z.string().optional(),
  /** Color CSS del velo sobre `backgroundImageUrl`, para que el contenido siga siendo legible. */
  backgroundOverlayColor: z.string().optional(),
});

export type SectionBackgroundProps = z.infer<typeof SectionBackgroundPropsSchema>;

const DEFAULT_BACKGROUND_OVERLAY = 'var(--brand-overlay)';

// Una sección con color propio se convierte en un mini-tema: si no, al pasar a modo oscuro
// el texto seguiría el tema global y quedaría ilegible sobre ese fondo fijo.
const surfaceTokens = (backgroundColor: string): CSSProperties => {
  const background = parseHex(backgroundColor);
  if (background === null) {
    return {};
  }
  const text = readableForeground(background);
  return {
    '--background': toHex(background),
    '--foreground': toHex(text),
    '--card': toHex(mix(background, text, 0.04)),
    '--card-foreground': toHex(text),
    '--muted': toHex(mix(background, text, 0.06)),
    '--muted-foreground': toHex(ensureContrast(mix(background, text, 0.55), background, 4.5)),
    '--border': toHex(mix(background, text, 0.14)),
    '--input': toHex(mix(background, text, 0.14)),
    color: toHex(text),
  } as CSSProperties;
};

/**
 * Estilo inline para el `<section>` raíz de cualquier bloque: imagen de
 * fondo con velo de contraste si hay `backgroundImageUrl`, si no el color
 * plano de `backgroundColor`, si no `undefined` (hereda el fondo del tema).
 */
// `data-surface` en el <section> hace que los tokens del estilo se recalculen con los
// colores locales; sin él, las tarjetas de una sección con color propio siguen el tema global.
export const sectionSurfaceAttributes = (
  props: SectionBackgroundProps,
): { 'data-surface'?: '' } =>
  props.backgroundColor !== undefined && parseHex(props.backgroundColor) !== null
    ? { 'data-surface': '' }
    : {};

export function sectionBackgroundStyle({
  backgroundColor,
  backgroundImageUrl,
  backgroundOverlayColor,
}: SectionBackgroundProps): CSSProperties | undefined {
  if (backgroundImageUrl !== undefined) {
    const overlay = backgroundOverlayColor ?? DEFAULT_BACKGROUND_OVERLAY;
    return {
      backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    };
  }
  if (backgroundColor !== undefined) {
    return { backgroundColor, ...surfaceTokens(backgroundColor) };
  }
  return undefined;
}
