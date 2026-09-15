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
  const dark =
    style.darkTokens === undefined
      ? ''
      : `.dark ${selector}{${declarations(style.darkTokens)}}`;
  return `${selector}{${declarations(style.tokens)}}${dark}${style.css ?? ''}`;
};

// El estilo del sitio va en `:root`, pero además se emiten las reglas de TODOS los estilos
// scopeadas por atributo: así un bloque puede sobrescribir el estilo del sitio con
// `data-visual-style="..."` y gana por especificidad, sin tocar el motor (Spec 2.1).
export function VisualStyleTokens({ styleId }: VisualStyleTokensProps): ReactElement {
  const active = findVisualStyle(styleId);
  const activeDark =
    active.darkTokens === undefined ? '' : `.dark{${declarations(active.darkTokens)}}`;

  const css = [
    `:root{${declarations(active.tokens)}}`,
    activeDark,
    ...VISUAL_STYLES.map(scopedRules),
  ].join('');

  return <style data-visual-style-tokens={active.id}>{css}</style>;
}
