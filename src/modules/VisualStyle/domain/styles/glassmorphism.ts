import type { VisualStyleDefinition } from '../VisualStyle';

export const glassmorphism: VisualStyleDefinition = {
  id: 'glassmorphism',
  label: 'Glassmorphism',
  description:
    'Tarjetas y menú de vidrio esmerilado sobre manchas de color. Moderno y liviano; luce mejor con imágenes de fondo.',
  tokens: {
    '--ui-radius': '1rem',
    '--ui-radius-lg': '1.5rem',
    '--ui-card-bg': 'color-mix(in srgb, var(--background) 55%, transparent)',
    '--ui-card-border-width': '1px',
    '--ui-card-border-color': 'color-mix(in srgb, var(--foreground) 12%, transparent)',
    '--ui-card-shadow':
      '0 8px 32px color-mix(in srgb, var(--foreground) 10%, transparent)',
    '--ui-card-backdrop': 'blur(16px) saturate(140%)',
    '--ui-button-radius': '999px',
    '--ui-button-border-width': '1px',
    '--ui-button-border-color': 'color-mix(in srgb, var(--foreground) 14%, transparent)',
    '--ui-button-shadow':
      '0 4px 16px color-mix(in srgb, var(--primary) 22%, transparent)',
    '--ui-button-active-shadow':
      '0 2px 8px color-mix(in srgb, var(--primary) 22%, transparent)',
    '--ui-button-active-translate': '1px',
    '--ui-button-weight': '600',
    '--ui-input-bg': 'color-mix(in srgb, var(--background) 60%, transparent)',
    '--ui-input-radius': '0.875rem',
    '--ui-input-border-width': '1px',
    '--ui-input-border-color': 'color-mix(in srgb, var(--foreground) 14%, transparent)',
    '--ui-input-shadow':
      'inset 0 1px 2px color-mix(in srgb, var(--foreground) 6%, transparent)',
    '--ui-nav-bg': 'color-mix(in srgb, var(--background) 45%, transparent)',
    '--ui-nav-border': '1px solid color-mix(in srgb, var(--foreground) 10%, transparent)',
    '--ui-nav-backdrop': 'blur(18px) saturate(140%)',
    '--ui-nav-shadow': '0 4px 24px color-mix(in srgb, var(--foreground) 8%, transparent)',
    '--ui-divider-color': 'color-mix(in srgb, var(--foreground) 10%, transparent)',
    '--ui-divider-width': '1px',
    '--ui-surface-bg': 'color-mix(in srgb, var(--primary) 6%, transparent)',
    '--ui-heading-weight': '700',
    '--ui-heading-tracking': '-0.02em',
    '--ui-transition': '220ms cubic-bezier(0.22, 1, 0.36, 1)',
    '--ui-page-bg':
      'radial-gradient(60rem 40rem at 12% -10%, color-mix(in srgb, var(--primary) 26%, transparent), transparent 60%), radial-gradient(50rem 36rem at 88% 8%, color-mix(in srgb, var(--accent) 24%, transparent), transparent 62%)',
  },
  // Sin backdrop-filter el vidrio se vuelve ilegible, así que ahí las superficies pasan a sólidas.
  css: `
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  [data-visual-style='glassmorphism'] {
    --ui-card-bg: color-mix(in srgb, var(--background) 94%, var(--primary));
    --ui-nav-bg: color-mix(in srgb, var(--background) 96%, var(--primary));
    --ui-input-bg: var(--background);
  }
}`,
};
