import type { VisualStyleDefinition } from '../VisualStyle';

export const bento: VisualStyleDefinition = {
  id: 'bento',
  label: 'Bento',
  description:
    'Tarjetas de distintos tamaños como una caja de almuerzo japonesa: esquinas muy redondeadas, fondos propios y poco borde.',
  tokens: {
    '--ui-radius': '1.25rem',
    '--ui-radius-lg': '2rem',
    '--ui-card-bg': 'color-mix(in srgb, var(--background) 94%, var(--primary) 6%)',
    '--ui-card-border-width': '1px',
    '--ui-card-border-color': 'color-mix(in srgb, var(--foreground) 8%, transparent)',
    '--ui-card-shadow':
      '0 12px 28px color-mix(in srgb, var(--foreground) 10%, transparent)',
    '--ui-card-backdrop': 'none',
    '--ui-button-radius': '1rem',
    '--ui-button-border-width': '0px',
    '--ui-button-border-color': 'transparent',
    '--ui-button-shadow':
      '0 6px 16px color-mix(in srgb, var(--primary) 20%, transparent)',
    '--ui-button-active-shadow':
      '0 2px 6px color-mix(in srgb, var(--primary) 20%, transparent)',
    '--ui-button-active-translate': '1px',
    '--ui-button-weight': '600',
    '--ui-input-bg': 'color-mix(in srgb, var(--background) 95%, var(--primary) 5%)',
    '--ui-input-radius': '0.875rem',
    '--ui-input-border-width': '1px',
    '--ui-input-border-color': 'color-mix(in srgb, var(--foreground) 10%, transparent)',
    '--ui-input-shadow': 'none',
    '--ui-nav-bg': 'color-mix(in srgb, var(--background) 96%, var(--primary) 4%)',
    '--ui-nav-border': '1px solid color-mix(in srgb, var(--foreground) 8%, transparent)',
    '--ui-nav-backdrop': 'none',
    '--ui-nav-shadow': 'none',
    '--ui-divider-color': 'color-mix(in srgb, var(--foreground) 8%, transparent)',
    '--ui-divider-width': '1px',
    '--ui-surface-bg': 'color-mix(in srgb, var(--background) 90%, var(--primary) 10%)',
    '--ui-heading-weight': '800',
    '--ui-heading-tracking': '-0.02em',
    '--ui-transition': '200ms cubic-bezier(0.22, 1, 0.36, 1)',
    '--ui-page-bg': 'none',
  },
  // En oscuro las tarjetas no pueden apoyarse en una sombra oscura (se pierde contra el fondo),
  // así que ganan un poco más de tinte y la sombra se vuelve un halo suave.
  darkTokens: {
    '--ui-card-bg': 'color-mix(in srgb, var(--background) 86%, var(--primary) 14%)',
    '--ui-card-border-color': 'color-mix(in srgb, var(--foreground) 12%, transparent)',
    '--ui-card-shadow':
      '0 16px 32px color-mix(in srgb, var(--foreground) 10%, transparent)',
    '--ui-surface-bg': 'color-mix(in srgb, var(--background) 82%, var(--primary) 18%)',
    '--ui-input-bg': 'color-mix(in srgb, var(--background) 88%, var(--primary) 12%)',
    '--ui-nav-bg': 'color-mix(in srgb, var(--background) 90%, var(--primary) 10%)',
  },
};
