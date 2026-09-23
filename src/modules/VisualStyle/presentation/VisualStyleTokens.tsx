import type { ReactElement } from 'react';
import { VISUAL_STYLES, findVisualStyle } from '../domain/registry';
import type { StyleTokens, VisualStyleDefinition } from '../domain/VisualStyle';

interface VisualStyleTokensProps {
  readonly styleId: string;
}

const declarations = (tokens: Partial<StyleTokens>): string =>
  Object.entries(tokens)
    .map(([name, value]) => `${name}:${value};`)
    .join('');

const scopedRules = (style: VisualStyleDefinition): string => {
  const selector = `[data-visual-style='${style.id}']`;
  // Una sección con color propio (`[data-surface]`) re-declara los tokens del estilo del SITIO
  // para resolverlos contra sus colores locales. Dentro de una página o bloque con otro estilo
  // eso la devolvería al estilo del sitio, así que también se repite la regla con este estilo,
  // más específica que la genérica.
  const surface = `${selector} [data-surface]`;
  const dark =
    style.darkTokens === undefined
      ? ''
      : `.dark ${selector},.dark ${surface}{${declarations(style.darkTokens)}}`;
  return `${selector},${surface}{${declarations(style.tokens)}}${dark}${style.css ?? ''}`;
};

// El estilo del sitio va en `:root`, pero además se emiten las reglas de TODOS los estilos
// scopeadas por atributo: así un bloque puede sobrescribir el estilo del sitio con
// `data-visual-style="..."` y gana por especificidad, sin tocar el motor (Spec 2.1).
export function VisualStyleTokens({ styleId }: VisualStyleTokensProps): ReactElement {
  const active = findVisualStyle(styleId);
  const activeDark =
    active.darkTokens === undefined ? '' : `.dark{${declarations(active.darkTokens)}}`;

  // Los tokens del estilo se repiten en `[data-surface]` porque un `var()` dentro de una
  // custom property se resuelve donde está DECLARADA, no donde se usa: declarado solo en
  // `:root`, `--ui-card-bg: var(--card)` congela el `--card` global y una sección con color
  // propio seguiría pintando sus tarjetas con el color del tema. Repetir la regla la vuelve
  // a resolver contra los valores locales de esa sección.
  const css = [
    `:root{${declarations(active.tokens)}}`,
    activeDark,
    `[data-surface]{${declarations(active.tokens)}}`,
    active.darkTokens === undefined
      ? ''
      : `.dark [data-surface]{${declarations(active.darkTokens)}}`,
    ...VISUAL_STYLES.map(scopedRules),
  ].join('');

  return <style data-visual-style-tokens={active.id}>{css}</style>;
}
