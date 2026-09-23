import type { VisualStyleDefinition } from '../VisualStyle';

export const maximalism: VisualStyleDefinition = {
  id: 'maximalism',
  label: 'Maximalismo',
  description:
    'Color saturado en grandes bloques, bordes gruesos, sombras duras de color y fondos con patrones. Enérgico y audaz, para moda, música, eventos y marcas jóvenes.',
  tokens: {
    '--ui-radius': '1rem',
    '--ui-radius-lg': '1.5rem',
    '--ui-card-bg': 'var(--card)',
    '--ui-card-border-width': '4px',
    '--ui-card-border-color': 'var(--primary)',
    '--ui-card-shadow': '6px 6px 0 0 var(--secondary), 12px 12px 0 0 var(--accent)',
    '--ui-card-backdrop': 'none',
    '--ui-button-radius': '0.75rem',
    '--ui-button-border-width': '4px',
    '--ui-button-border-color': 'var(--foreground)',
    '--ui-button-shadow': '6px 6px 0 0 var(--accent)',
    '--ui-button-active-shadow': '0 0 0 0 var(--accent)',
    '--ui-button-active-translate': '6px',
    '--ui-button-weight': '900',
    '--ui-input-bg': 'var(--background)',
    '--ui-input-radius': '0.5rem',
    '--ui-input-border-width': '4px',
    '--ui-input-border-color': 'var(--primary)',
    '--ui-input-shadow': '4px 4px 0 0 var(--secondary)',
    '--ui-nav-bg': 'var(--background)',
    '--ui-nav-border': '4px solid var(--primary)',
    '--ui-nav-backdrop': 'none',
    '--ui-nav-shadow': '0 8px 0 0 var(--accent)',
    '--ui-divider-color': 'var(--primary)',
    '--ui-divider-width': '4px',
    '--ui-surface-bg': 'var(--background)',
    '--ui-heading-weight': '900',
    '--ui-heading-tracking': '-0.06em',
    '--ui-transition': '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    '--ui-page-bg':
      'repeating-linear-gradient(45deg, transparent, transparent 10px, color-mix(in srgb, var(--primary) 10%, transparent) 10px, color-mix(in srgb, var(--primary) 10%, transparent) 20px)',
  },
  // Títulos en mayúsculas y apretados en toda la página, no solo en `.ui-heading`: el hero y
  // los bloques usan h1/h2 directos. Sin sombra de texto, que ensucia la lectura.
  css: `
[data-visual-style='maximalism'] :is(h1, h2, .ui-heading) {
  text-transform: uppercase;
  letter-spacing: -0.04em;
}
`,
};
