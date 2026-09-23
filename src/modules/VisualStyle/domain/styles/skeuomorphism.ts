import type { VisualStyleDefinition } from '../VisualStyle';

export const skeuomorphism: VisualStyleDefinition = {
  id: 'skeuomorphism',
  label: 'Skeuomorfismo',
  description:
    'Superficies táctiles con relieves, biseles y brillo, como objetos reales. Cálido y artesanal, para restaurantes, artesanía y productos premium.',
  tokens: {
    '--ui-radius': '0.75rem',
    '--ui-radius-lg': '1rem',
    '--ui-card-bg': 'var(--background)',
    '--ui-card-border-width': '1px',
    '--ui-card-border-color': 'color-mix(in srgb, var(--foreground) 15%, transparent)',
    '--ui-card-shadow':
      '0 8px 16px -4px color-mix(in srgb, var(--foreground) 30%, transparent), 0 4px 8px -4px color-mix(in srgb, var(--foreground) 20%, transparent), inset 0 2px 0 color-mix(in srgb, var(--background) 80%, transparent)',
    '--ui-card-backdrop': 'none',
    '--ui-button-radius': '0.5rem',
    '--ui-button-border-width': '1px',
    '--ui-button-border-color': 'color-mix(in srgb, var(--foreground) 40%, transparent)',
    '--ui-button-shadow':
      '0 4px 6px -1px color-mix(in srgb, var(--foreground) 30%, transparent), inset 0 2px 2px color-mix(in srgb, var(--background) 50%, transparent), inset 0 -2px 2px color-mix(in srgb, var(--foreground) 15%, transparent)',
    '--ui-button-active-shadow':
      'inset 0 4px 6px color-mix(in srgb, var(--foreground) 40%, transparent), 0 1px 1px color-mix(in srgb, var(--background) 50%, transparent)',
    '--ui-button-active-translate': '2px',
    '--ui-button-weight': '600',
    '--ui-input-bg': 'color-mix(in srgb, var(--foreground) 3%, var(--background))',
    '--ui-input-radius': '0.375rem',
    '--ui-input-border-width': '1px',
    '--ui-input-border-color': 'color-mix(in srgb, var(--foreground) 30%, transparent)',
    '--ui-input-shadow':
      'inset 0 3px 6px color-mix(in srgb, var(--foreground) 15%, transparent), 0 1px 0 color-mix(in srgb, var(--background) 60%, transparent)',
    '--ui-nav-bg': 'var(--background)',
    '--ui-nav-border': '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)',
    '--ui-nav-backdrop': 'none',
    '--ui-nav-shadow':
      '0 4px 12px -2px color-mix(in srgb, var(--foreground) 25%, transparent)',
    '--ui-divider-color': 'color-mix(in srgb, var(--foreground) 15%, transparent)',
    '--ui-divider-width': '2px',
    '--ui-surface-bg': 'color-mix(in srgb, var(--background) 95%, var(--primary) 5%)',
    '--ui-heading-weight': '800',
    '--ui-heading-tracking': '0em',
    '--ui-transition': '200ms ease',
    '--ui-page-bg': 'none',
  },
  darkTokens: {
    '--ui-card-shadow':
      '0 8px 16px -4px color-mix(in srgb, var(--background) 40%, transparent), 0 4px 8px -4px color-mix(in srgb, var(--background) 30%, transparent), inset 0 2px 0 color-mix(in srgb, var(--foreground) 15%, transparent)',
    '--ui-button-shadow':
      '0 4px 6px -1px color-mix(in srgb, var(--background) 50%, transparent), inset 0 2px 2px color-mix(in srgb, var(--foreground) 20%, transparent), inset 0 -2px 2px color-mix(in srgb, var(--background) 40%, transparent)',
    '--ui-button-active-shadow':
      'inset 0 4px 6px color-mix(in srgb, var(--background) 60%, transparent), 0 1px 1px color-mix(in srgb, var(--foreground) 20%, transparent)',
    '--ui-input-shadow':
      'inset 0 3px 6px color-mix(in srgb, var(--background) 30%, transparent), 0 1px 0 color-mix(in srgb, var(--foreground) 10%, transparent)',
    '--ui-nav-shadow':
      '0 4px 12px -2px color-mix(in srgb, var(--background) 40%, transparent)',
  },
  css: `
[data-visual-style='skeuomorphism'] .ui-button {
  background-image: linear-gradient(to bottom, color-mix(in srgb, var(--background) 15%, transparent), color-mix(in srgb, var(--foreground) 10%, transparent));
}
[data-visual-style='skeuomorphism'] .ui-card {
  background-image: linear-gradient(to bottom, color-mix(in srgb, var(--background) 50%, transparent), color-mix(in srgb, var(--foreground) 5%, transparent));
}
[data-visual-style='skeuomorphism'] .ui-nav {
  background-image: linear-gradient(to bottom, color-mix(in srgb, var(--background) 50%, transparent), color-mix(in srgb, var(--foreground) 5%, transparent));
}
`,
};
