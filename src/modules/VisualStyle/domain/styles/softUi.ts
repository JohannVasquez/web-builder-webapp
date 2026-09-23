import type { VisualStyleDefinition } from '../VisualStyle';

// Tono "hundido" (esquina oscura) y "elevado" (esquina clara) del relieve, mezclando solo bg/fg.
const SUNKEN = 'color-mix(in srgb, var(--foreground) 20%, var(--background) 80%)';
const RAISED = 'color-mix(in srgb, var(--background) 96%, var(--foreground) 4%)';
const SUNKEN_DARK = 'color-mix(in srgb, var(--background) 55%, transparent)';
const RAISED_DARK = 'color-mix(in srgb, var(--foreground) 22%, var(--background) 78%)';

export const softUi: VisualStyleDefinition = {
  id: 'soft-ui',
  label: 'Soft UI / Neumorphism',
  description:
    'Elementos que parecen moldeados en la misma superficie del fondo, con luces y sombras suaves en vez de bordes. Táctil y calmado.',
  tokens: {
    '--ui-radius': '1.25rem',
    '--ui-radius-lg': '1.75rem',
    '--ui-card-bg': 'color-mix(in srgb, var(--background) 96%, var(--foreground) 4%)',
    '--ui-card-border-width': '0px',
    '--ui-card-border-color': 'transparent',
    '--ui-card-shadow': `-8px -8px 20px color-mix(in srgb, ${RAISED} 75%, transparent), 8px 8px 20px color-mix(in srgb, ${SUNKEN} 55%, transparent)`,
    '--ui-card-backdrop': 'none',
    '--ui-button-radius': '999px',
    '--ui-button-border-width': '0px',
    '--ui-button-border-color': 'transparent',
    '--ui-button-shadow': `-4px -4px 10px color-mix(in srgb, ${RAISED} 70%, transparent), 4px 4px 10px color-mix(in srgb, ${SUNKEN} 55%, transparent)`,
    '--ui-button-active-shadow': `inset 3px 3px 8px color-mix(in srgb, ${SUNKEN} 60%, transparent), inset -3px -3px 8px color-mix(in srgb, ${RAISED} 70%, transparent)`,
    '--ui-button-active-translate': '1px',
    '--ui-button-weight': '600',
    '--ui-input-bg': 'color-mix(in srgb, var(--background) 94%, var(--foreground) 6%)',
    '--ui-input-radius': '1rem',
    '--ui-input-border-width': '0px',
    '--ui-input-border-color': 'transparent',
    '--ui-input-shadow': `inset 3px 3px 8px color-mix(in srgb, ${SUNKEN} 55%, transparent), inset -3px -3px 8px color-mix(in srgb, ${RAISED} 65%, transparent)`,
    '--ui-nav-bg': 'color-mix(in srgb, var(--background) 96%, var(--foreground) 4%)',
    '--ui-nav-border': '0px solid transparent',
    '--ui-nav-backdrop': 'none',
    '--ui-nav-shadow': `0 6px 16px color-mix(in srgb, ${SUNKEN} 45%, transparent)`,
    '--ui-divider-color': 'color-mix(in srgb, var(--foreground) 10%, transparent)',
    '--ui-divider-width': '1px',
    '--ui-surface-bg': 'color-mix(in srgb, var(--background) 90%, var(--foreground) 10%)',
    '--ui-heading-weight': '700',
    '--ui-heading-tracking': '-0.01em',
    '--ui-transition': '250ms ease',
    '--ui-page-bg': 'none',
  },
  // En modo oscuro el fondo ya es la parte "hundida": se invierte a qué lado se mezcla más.
  darkTokens: {
    '--ui-card-bg': 'color-mix(in srgb, var(--background) 92%, var(--foreground) 8%)',
    '--ui-card-shadow': `-8px -8px 20px color-mix(in srgb, ${RAISED_DARK} 60%, transparent), 8px 8px 20px color-mix(in srgb, ${SUNKEN_DARK} 70%, transparent)`,
    '--ui-button-shadow': `-4px -4px 10px color-mix(in srgb, ${RAISED_DARK} 55%, transparent), 4px 4px 10px color-mix(in srgb, ${SUNKEN_DARK} 70%, transparent)`,
    '--ui-button-active-shadow': `inset 3px 3px 8px color-mix(in srgb, ${SUNKEN_DARK} 75%, transparent), inset -3px -3px 8px color-mix(in srgb, ${RAISED_DARK} 55%, transparent)`,
    '--ui-input-bg': 'color-mix(in srgb, var(--background) 88%, var(--foreground) 12%)',
    '--ui-input-shadow': `inset 3px 3px 8px color-mix(in srgb, ${SUNKEN_DARK} 70%, transparent), inset -3px -3px 8px color-mix(in srgb, ${RAISED_DARK} 50%, transparent)`,
    '--ui-nav-bg': 'color-mix(in srgb, var(--background) 92%, var(--foreground) 8%)',
    '--ui-nav-shadow': `0 6px 16px color-mix(in srgb, ${SUNKEN_DARK} 60%, transparent)`,
    '--ui-surface-bg': 'color-mix(in srgb, var(--background) 82%, var(--foreground) 18%)',
  },
};
