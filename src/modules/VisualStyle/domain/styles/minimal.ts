import type { VisualStyleDefinition } from '../VisualStyle';

export const minimal: VisualStyleDefinition = {
  id: 'minimal',
  label: 'Minimalista',
  description:
    'Mucho aire, casi sin sombras ni bordes, líneas finas como separadores. La tipografía es la protagonista.',
  tokens: {
    '--ui-radius': '0px',
    '--ui-radius-lg': '0px',
    '--ui-card-bg': 'transparent',
    '--ui-card-border-width': '0px',
    '--ui-card-border-color': 'transparent',
    '--ui-card-shadow': 'none',
    '--ui-card-backdrop': 'none',
    '--ui-button-radius': '0px',
    '--ui-button-border-width': '1px',
    '--ui-button-border-color': 'var(--foreground)',
    '--ui-button-shadow': 'none',
    '--ui-button-active-shadow': 'none',
    '--ui-button-active-translate': '0px',
    '--ui-button-weight': '500',
    '--ui-input-bg': 'transparent',
    '--ui-input-radius': '0px',
    '--ui-input-border-width': '0 0 1px 0',
    '--ui-input-border-color': 'var(--border)',
    '--ui-input-shadow': 'none',
    '--ui-nav-bg': 'var(--background)',
    '--ui-nav-border': '1px solid var(--border)',
    '--ui-nav-backdrop': 'none',
    '--ui-nav-shadow': 'none',
    '--ui-divider-color': 'var(--border)',
    '--ui-divider-width': '1px',
    '--ui-surface-bg': 'transparent',
    '--ui-heading-weight': '400',
    '--ui-heading-tracking': '-0.03em',
    '--ui-transition': '200ms ease',
    '--ui-page-bg': 'none',
  },
  // Sin tarjetas ni fondos, la única separación entre bloques es una línea fina.
  css: `
[data-visual-style='minimal'] .ui-card + .ui-card {
  border-top: 1px solid var(--border);
}`,
};
