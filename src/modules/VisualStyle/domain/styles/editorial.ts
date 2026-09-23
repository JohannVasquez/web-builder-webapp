import type { VisualStyleDefinition } from '../VisualStyle';

export const editorial: VisualStyleDefinition = {
  id: 'editorial',
  label: 'Editorial',
  description:
    'Aspecto de revista: títulos con mucho peso, líneas divisorias marcadas, casi sin sombras y esquinas rectas.',
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
    '--ui-button-weight': '700',
    '--ui-input-bg': 'transparent',
    '--ui-input-radius': '0px',
    '--ui-input-border-width': '0 0 2px 0',
    '--ui-input-border-color': 'var(--foreground)',
    '--ui-input-shadow': 'none',
    '--ui-nav-bg': 'var(--background)',
    '--ui-nav-border': '2px solid var(--foreground)',
    '--ui-nav-backdrop': 'none',
    '--ui-nav-shadow': 'none',
    '--ui-divider-color': 'var(--foreground)',
    '--ui-divider-width': '2px',
    '--ui-surface-bg': 'color-mix(in srgb, var(--background) 96%, var(--foreground) 4%)',
    '--ui-heading-weight': '800',
    '--ui-heading-tracking': '-0.02em',
    '--ui-transition': '150ms ease',
    '--ui-page-bg': 'none',
  },
  // Sin tarjetas ni sombras, el ritmo entre bloques lo marca una regla gruesa, como en una revista.
  css: `
[data-visual-style='editorial'] .ui-card + .ui-card {
  border-top: var(--ui-divider-width) solid var(--ui-divider-color);
  margin-top: 2rem;
  padding-top: 2rem;
}`,
};
