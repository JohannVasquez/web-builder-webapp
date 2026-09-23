import type { VisualStyleDefinition } from '../VisualStyle';

export const liquidGlass: VisualStyleDefinition = {
  id: 'liquid-glass',
  label: 'Liquid glass',
  description:
    'Vidrio translúcido y limpio con reflejos en los bordes y botones en cápsula, al estilo de Apple. Premium y fluido, para tecnología, productos digitales y marcas modernas.',
  tokens: {
    '--ui-radius': '1.5rem',
    '--ui-radius-lg': '2rem',
    '--ui-card-bg': 'color-mix(in srgb, var(--background) 75%, transparent)',
    '--ui-card-border-width': '1px',
    '--ui-card-border-color': 'color-mix(in srgb, var(--foreground) 10%, transparent)',
    '--ui-card-shadow':
      '0 8px 32px color-mix(in srgb, var(--foreground) 6%, transparent), inset 0 1px 1px 0 color-mix(in srgb, var(--background) 80%, transparent), inset 0 -1px 1px 0 color-mix(in srgb, var(--foreground) 4%, transparent)',
    '--ui-card-backdrop': 'blur(24px) saturate(180%)',
    '--ui-button-radius': '999px',
    '--ui-button-border-width': '1px',
    '--ui-button-border-color': 'color-mix(in srgb, var(--foreground) 12%, transparent)',
    '--ui-button-shadow':
      '0 4px 12px color-mix(in srgb, var(--foreground) 8%, transparent), inset 0 1px 1px 0 color-mix(in srgb, var(--background) 50%, transparent)',
    '--ui-button-active-shadow':
      '0 2px 4px color-mix(in srgb, var(--foreground) 8%, transparent)',
    '--ui-button-active-translate': '2px',
    '--ui-button-weight': '500',
    '--ui-input-bg': 'color-mix(in srgb, var(--background) 70%, transparent)',
    '--ui-input-radius': '1rem',
    '--ui-input-border-width': '1px',
    '--ui-input-border-color': 'color-mix(in srgb, var(--foreground) 15%, transparent)',
    '--ui-input-shadow':
      'inset 0 2px 4px color-mix(in srgb, var(--foreground) 4%, transparent), 0 1px 1px color-mix(in srgb, var(--background) 60%, transparent)',
    '--ui-nav-bg': 'color-mix(in srgb, var(--background) 75%, transparent)',
    '--ui-nav-border': '1px solid color-mix(in srgb, var(--foreground) 10%, transparent)',
    '--ui-nav-backdrop': 'blur(32px) saturate(200%)',
    '--ui-nav-shadow':
      '0 4px 24px color-mix(in srgb, var(--foreground) 6%, transparent), inset 0 1px 1px 0 color-mix(in srgb, var(--background) 80%, transparent)',
    '--ui-divider-color': 'color-mix(in srgb, var(--foreground) 8%, transparent)',
    '--ui-divider-width': '1px',
    '--ui-surface-bg': 'color-mix(in srgb, var(--background) 85%, transparent)',
    '--ui-heading-weight': '600',
    '--ui-heading-tracking': '-0.03em',
    '--ui-transition': '300ms cubic-bezier(0.25, 1, 0.5, 1)',
    '--ui-page-bg':
      'radial-gradient(circle at 10% 10%, color-mix(in srgb, var(--primary) 15%, transparent), transparent 40%), radial-gradient(circle at 90% 90%, color-mix(in srgb, var(--accent) 15%, transparent), transparent 40%)',
  },
  darkTokens: {
    '--ui-card-border-color': 'color-mix(in srgb, var(--foreground) 15%, transparent)',
    '--ui-card-shadow':
      '0 8px 32px color-mix(in srgb, var(--background) 6%, transparent), inset 0 1px 1px 0 color-mix(in srgb, var(--foreground) 15%, transparent), inset 0 -1px 1px 0 color-mix(in srgb, var(--background) 10%, transparent)',
    '--ui-nav-shadow':
      '0 4px 24px color-mix(in srgb, var(--background) 6%, transparent), inset 0 1px 1px 0 color-mix(in srgb, var(--foreground) 15%, transparent)',
  },
  // Soporte para navegadores sin backdrop-filter
  css: `
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  [data-visual-style='liquid-glass'] {
    --ui-card-bg: color-mix(in srgb, var(--background) 95%, var(--primary));
    --ui-nav-bg: color-mix(in srgb, var(--background) 97%, var(--primary));
    --ui-input-bg: var(--background);
    --ui-surface-bg: color-mix(in srgb, var(--background) 98%, var(--primary));
  }
}`,
};
