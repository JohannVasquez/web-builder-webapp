import type { VisualStyleDefinition } from '../VisualStyle';

const HIGHLIGHT = 'color-mix(in srgb, var(--background) 80%, transparent)';
const SHADOW = 'color-mix(in srgb, var(--foreground) 12%, transparent)';
const SHADOW_OUTER = 'color-mix(in srgb, var(--foreground) 8%, transparent)';

const HIGHLIGHT_DARK = 'color-mix(in srgb, var(--foreground) 12%, transparent)';
const SHADOW_DARK = 'color-mix(in srgb, var(--background) 60%, transparent)';
const SHADOW_OUTER_DARK = 'color-mix(in srgb, var(--background) 80%, transparent)';

export const claymorphism: VisualStyleDefinition = {
  id: 'claymorphism',
  label: 'Claymorfismo',
  description:
    'Estilo amable y lúdico con efecto de arcilla 3D. Súper útil para clientes orientados a niños, educación o apps de consumo.',
  tokens: {
    '--ui-radius': '1.5rem',
    '--ui-radius-lg': '2rem',
    '--ui-card-bg': 'color-mix(in srgb, var(--background) 96%, var(--primary) 4%)',
    '--ui-card-border-width': '0px',
    '--ui-card-border-color': 'transparent',
    '--ui-card-shadow': `8px 8px 24px ${SHADOW_OUTER}, inset 6px 6px 12px ${HIGHLIGHT}, inset -6px -6px 12px ${SHADOW}`,
    '--ui-card-backdrop': 'none',
    '--ui-button-radius': '999px',
    '--ui-button-border-width': '0px',
    '--ui-button-border-color': 'transparent',
    '--ui-button-shadow': `6px 6px 16px ${SHADOW_OUTER}, inset 4px 4px 8px ${HIGHLIGHT}, inset -4px -4px 8px ${SHADOW}`,
    '--ui-button-active-shadow': `inset 6px 6px 12px ${SHADOW}, inset -6px -6px 12px ${HIGHLIGHT}`,
    '--ui-button-active-translate': '4px',
    '--ui-button-weight': '600',
    '--ui-input-bg': 'color-mix(in srgb, var(--background) 94%, var(--foreground) 6%)',
    '--ui-input-radius': '1rem',
    '--ui-input-border-width': '0px',
    '--ui-input-border-color': 'transparent',
    '--ui-input-shadow': `inset 4px 4px 8px ${SHADOW}, inset -4px -4px 8px ${HIGHLIGHT}`,
    '--ui-nav-bg': 'color-mix(in srgb, var(--background) 96%, var(--primary) 4%)',
    '--ui-nav-border': '0px solid transparent',
    '--ui-nav-backdrop': 'none',
    '--ui-nav-shadow': `0 8px 24px ${SHADOW_OUTER}, inset 0 -4px 8px ${SHADOW}`,
    '--ui-divider-color': 'color-mix(in srgb, var(--foreground) 10%, transparent)',
    '--ui-divider-width': '2px',
    '--ui-surface-bg': 'color-mix(in srgb, var(--background) 90%, var(--primary) 10%)',
    '--ui-heading-weight': '800',
    '--ui-heading-tracking': '-0.02em',
    '--ui-transition': '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    '--ui-page-bg': 'none',
  },
  darkTokens: {
    '--ui-card-bg': 'color-mix(in srgb, var(--background) 96%, var(--primary) 4%)',
    '--ui-card-shadow': `8px 8px 24px ${SHADOW_OUTER_DARK}, inset 6px 6px 12px ${HIGHLIGHT_DARK}, inset -6px -6px 12px ${SHADOW_DARK}`,
    '--ui-button-shadow': `6px 6px 16px ${SHADOW_OUTER_DARK}, inset 4px 4px 8px ${HIGHLIGHT_DARK}, inset -4px -4px 8px ${SHADOW_DARK}`,
    '--ui-button-active-shadow': `inset 6px 6px 12px ${SHADOW_DARK}, inset -6px -6px 12px ${HIGHLIGHT_DARK}`,
    '--ui-input-bg': 'color-mix(in srgb, var(--background) 92%, var(--foreground) 8%)',
    '--ui-input-shadow': `inset 4px 4px 8px ${SHADOW_DARK}, inset -4px -4px 8px ${HIGHLIGHT_DARK}`,
    '--ui-nav-bg': 'color-mix(in srgb, var(--background) 96%, var(--primary) 4%)',
    '--ui-nav-shadow': `0 8px 24px ${SHADOW_OUTER_DARK}, inset 0 -4px 8px ${SHADOW_DARK}`,
    '--ui-surface-bg': 'color-mix(in srgb, var(--background) 90%, var(--primary) 10%)',
  },
  css: `
    [data-visual-style='claymorphism'] .ui-button {
      transform: translateY(0);
    }
    @media (prefers-reduced-motion: no-preference) {
      [data-visual-style='claymorphism'] .ui-button:active {
        transform: translateY(var(--ui-button-active-translate, 4px));
      }
    }
  `,
};
