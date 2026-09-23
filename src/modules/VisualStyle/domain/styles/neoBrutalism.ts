import type { VisualStyleDefinition } from '../VisualStyle';

const HARD_SHADOW = '6px 6px 0 0 var(--foreground)';

export const neoBrutalism: VisualStyleDefinition = {
  id: 'neo-brutalism',
  label: 'Neo-Brutalism',
  description:
    'Bordes gruesos, sombras duras sin difuminar y colores planos. Directo y memorable; ideal para marcas jóvenes.',
  tokens: {
    '--ui-radius': '0.25rem',
    '--ui-radius-lg': '0.375rem',
    '--ui-card-bg': 'var(--background)',
    '--ui-card-border-width': '3px',
    '--ui-card-border-color': 'var(--foreground)',
    '--ui-card-shadow': HARD_SHADOW,
    '--ui-card-backdrop': 'none',
    '--ui-button-radius': '0.25rem',
    '--ui-button-border-width': '3px',
    '--ui-button-border-color': 'var(--foreground)',
    '--ui-button-shadow': '4px 4px 0 0 var(--foreground)',
    '--ui-button-active-shadow': '0 0 0 0 var(--foreground)',
    '--ui-button-active-translate': '4px',
    '--ui-button-weight': '800',
    '--ui-input-bg': 'var(--background)',
    '--ui-input-radius': '0.25rem',
    '--ui-input-border-width': '3px',
    '--ui-input-border-color': 'var(--foreground)',
    '--ui-input-shadow': 'none',
    '--ui-nav-bg': 'var(--background)',
    '--ui-nav-border': '3px solid var(--foreground)',
    '--ui-nav-backdrop': 'none',
    '--ui-nav-shadow': '0 4px 0 0 var(--foreground)',
    '--ui-divider-color': 'var(--foreground)',
    '--ui-divider-width': '3px',
    '--ui-surface-bg': 'var(--brand-accent-soft)',
    '--ui-heading-weight': '900',
    '--ui-heading-tracking': '-0.04em',
    '--ui-transition': '80ms linear',
    '--ui-page-bg': 'none',
  },
};
