import type { VisualStyleDefinition } from '../VisualStyle';

export const spatialUi: VisualStyleDefinition = {
  id: 'spatial-ui',
  label: 'Spatial UI',
  description:
    'Paneles que flotan sobre un fondo ambiental amplio con material esmerilado, profundidad y botones redondeados. Útil para arquitectura, inmobiliarias, experiencias y tecnología.',
  tokens: {
    '--ui-radius': '2rem',
    '--ui-radius-lg': '2.5rem',
    '--ui-card-bg': 'color-mix(in srgb, var(--background) 90%, transparent)',
    '--ui-card-border-width': '1px',
    '--ui-card-border-color': 'color-mix(in srgb, var(--foreground) 10%, transparent)',
    '--ui-card-shadow':
      '0 16px 48px -4px color-mix(in srgb, var(--foreground) 10%, transparent), 0 8px 16px -4px color-mix(in srgb, var(--foreground) 5%, transparent)',
    '--ui-card-backdrop': 'blur(24px) saturate(150%)',
    '--ui-button-radius': '999px',
    '--ui-button-border-width': '1px',
    '--ui-button-border-color': 'color-mix(in srgb, var(--foreground) 15%, transparent)',
    '--ui-button-shadow':
      '0 4px 12px color-mix(in srgb, var(--foreground) 8%, transparent), inset 0 1px 0 color-mix(in srgb, var(--background) 20%, transparent)',
    '--ui-button-active-shadow':
      '0 2px 4px color-mix(in srgb, var(--foreground) 8%, transparent)',
    '--ui-button-active-translate': '1px',
    '--ui-button-weight': '500',
    '--ui-input-bg': 'color-mix(in srgb, var(--background) 90%, transparent)',
    '--ui-input-radius': '1.25rem',
    '--ui-input-border-width': '1px',
    '--ui-input-border-color': 'color-mix(in srgb, var(--foreground) 12%, transparent)',
    '--ui-input-shadow':
      'inset 0 2px 4px color-mix(in srgb, var(--foreground) 5%, transparent)',
    '--ui-nav-bg': 'color-mix(in srgb, var(--background) 90%, transparent)',
    '--ui-nav-border': '1px solid color-mix(in srgb, var(--foreground) 8%, transparent)',
    '--ui-nav-backdrop': 'blur(32px) saturate(150%)',
    '--ui-nav-shadow': '0 8px 32px color-mix(in srgb, var(--foreground) 8%, transparent)',
    '--ui-divider-color': 'color-mix(in srgb, var(--foreground) 8%, transparent)',
    '--ui-divider-width': '1px',
    '--ui-surface-bg': 'color-mix(in srgb, var(--background) 90%, transparent)',
    '--ui-heading-weight': '600',
    '--ui-heading-tracking': '-0.02em',
    '--ui-transition': '300ms cubic-bezier(0.25, 1, 0.5, 1)',
    '--ui-page-bg':
      'radial-gradient(120% 120% at 50% -10%, color-mix(in srgb, var(--primary) 12%, transparent), transparent 70%), radial-gradient(100% 100% at 10% 110%, color-mix(in srgb, var(--secondary) 12%, transparent), transparent 60%)',
  },
  darkTokens: {
    '--ui-card-shadow':
      '0 16px 48px -4px color-mix(in srgb, var(--foreground) 20%, transparent), 0 8px 16px -4px color-mix(in srgb, var(--foreground) 10%, transparent)',
  },
  // Sin backdrop-filter el material esmerilado se vuelve ilegible, pasamos a fondos sólidos.
  css: `
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  [data-visual-style='spatial-ui'] {
    --ui-card-bg: var(--background);
    --ui-nav-bg: var(--background);
    --ui-input-bg: var(--background);
    --ui-surface-bg: var(--background);
  }
}
@media (prefers-reduced-motion: no-preference) {
  [data-visual-style='spatial-ui'] .ui-card {
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }
  [data-visual-style='spatial-ui'] .ui-card:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 24px 64px -8px color-mix(in srgb, var(--foreground) 15%, transparent), 0 12px 24px -8px color-mix(in srgb, var(--foreground) 10%, transparent);
  }
}
`,
};
