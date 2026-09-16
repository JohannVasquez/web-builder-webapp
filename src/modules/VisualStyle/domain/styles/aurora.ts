import type { VisualStyleDefinition } from '../VisualStyle';

export const aurora: VisualStyleDefinition = {
  id: 'aurora',
  label: 'Tech oscuro / Aurora',
  description:
    'Degradados luminosos que se mueven despacio sobre un fondo con ánimo oscuro, bordes con brillo sutil. Sensación de producto tecnológico.',
  tokens: {
    '--ui-radius': '1rem',
    '--ui-radius-lg': '1.25rem',
    '--ui-card-bg': 'color-mix(in srgb, var(--background) 88%, var(--primary) 12%)',
    '--ui-card-border-width': '1px',
    '--ui-card-border-color': 'color-mix(in srgb, var(--primary) 35%, transparent)',
    '--ui-card-shadow':
      '0 0 0 1px color-mix(in srgb, var(--primary) 14%, transparent), 0 16px 40px color-mix(in srgb, var(--primary) 18%, transparent)',
    '--ui-card-backdrop': 'none',
    '--ui-button-radius': '0.75rem',
    '--ui-button-border-width': '1px',
    '--ui-button-border-color': 'color-mix(in srgb, var(--brand-accent) 45%, transparent)',
    '--ui-button-shadow': '0 0 24px color-mix(in srgb, var(--primary) 32%, transparent)',
    '--ui-button-active-shadow': '0 0 10px color-mix(in srgb, var(--primary) 32%, transparent)',
    '--ui-button-active-translate': '1px',
    '--ui-button-weight': '600',
    '--ui-input-bg': 'color-mix(in srgb, var(--background) 92%, var(--primary) 8%)',
    '--ui-input-radius': '0.75rem',
    '--ui-input-border-width': '1px',
    '--ui-input-border-color': 'color-mix(in srgb, var(--primary) 28%, transparent)',
    '--ui-input-shadow': 'inset 0 1px 2px color-mix(in srgb, var(--foreground) 8%, transparent)',
    '--ui-nav-bg': 'color-mix(in srgb, var(--background) 82%, transparent)',
    '--ui-nav-border': '1px solid color-mix(in srgb, var(--primary) 24%, transparent)',
    '--ui-nav-backdrop': 'blur(14px)',
    '--ui-nav-shadow': '0 8px 30px color-mix(in srgb, var(--primary) 16%, transparent)',
    '--ui-divider-color': 'color-mix(in srgb, var(--primary) 22%, transparent)',
    '--ui-divider-width': '1px',
    '--ui-surface-bg': 'color-mix(in srgb, var(--background) 90%, var(--primary) 10%)',
    '--ui-heading-weight': '700',
    '--ui-heading-tracking': '-0.02em',
    '--ui-transition': '260ms ease',
    // Capa decorativa (sin texto encima): la única parte que se permite ser "oscura por naturaleza"
    // sin pelearse con el modo claro/oscuro que elija el cliente para el resto del sitio.
    '--ui-page-bg':
      "radial-gradient(60rem 42rem at 12% -8%, color-mix(in srgb, var(--primary) 38%, transparent), transparent 60%), radial-gradient(55rem 44rem at 88% 4%, color-mix(in srgb, var(--brand-accent) 34%, transparent), transparent 62%), radial-gradient(65rem 52rem at 50% 116%, color-mix(in srgb, var(--primary) 26%, transparent), transparent 66%), linear-gradient(180deg, color-mix(in srgb, var(--foreground) 6%, transparent), color-mix(in srgb, var(--foreground) 6%, transparent))",
  },
  // Con el cliente ya en modo oscuro, las superficies pueden ser más profundas y el brillo más intenso.
  darkTokens: {
    '--ui-card-bg': 'color-mix(in srgb, var(--background) 80%, var(--primary) 20%)',
    '--ui-card-border-color': 'color-mix(in srgb, var(--primary) 45%, transparent)',
    '--ui-card-shadow':
      '0 0 0 1px color-mix(in srgb, var(--primary) 24%, transparent), 0 20px 50px color-mix(in srgb, var(--primary) 28%, transparent)',
    '--ui-surface-bg': 'color-mix(in srgb, var(--background) 78%, var(--primary) 22%)',
    '--ui-input-bg': 'color-mix(in srgb, var(--background) 85%, var(--primary) 15%)',
    '--ui-nav-bg': 'color-mix(in srgb, var(--background) 65%, transparent)',
    '--ui-nav-shadow': '0 10px 40px color-mix(in srgb, var(--primary) 22%, transparent)',
  },
  css: `
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  [data-visual-style='aurora'] {
    --ui-nav-bg: color-mix(in srgb, var(--background) 94%, var(--primary) 6%);
  }
}
@keyframes aurora-drift {
  0%, 100% { background-position: 12% -8%, 88% 4%, 50% 116%, 0% 0%; }
  50% { background-position: 22% 4%, 78% 14%, 46% 108%, 0% 0%; }
}
[data-visual-style='aurora'] .ui-page-backdrop::before {
  background-size: 140% 140%, 130% 130%, 150% 150%, 100% 100%;
  animation: aurora-drift 24s ease-in-out infinite;
}`,
};
