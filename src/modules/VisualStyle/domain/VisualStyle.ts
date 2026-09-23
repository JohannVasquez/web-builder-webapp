// Un estilo visual solo declara valores para estos tokens; ningún bloque sabe qué estilo está activo.
export interface VisualStyleDefinition {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly tokens: StyleTokens;
  // Solo los tokens que cambian en modo oscuro; el resto se hereda del claro.
  readonly darkTokens?: Partial<StyleTokens>;
  // Reglas extra que no caben en un token, ya scopeadas por el estilo que las declara.
  readonly css?: string;
}

export interface StyleTokens {
  '--ui-radius': string;
  '--ui-radius-lg': string;
  '--ui-card-bg': string;
  '--ui-card-border-width': string;
  '--ui-card-border-color': string;
  '--ui-card-shadow': string;
  '--ui-card-backdrop': string;
  '--ui-button-radius': string;
  '--ui-button-border-width': string;
  '--ui-button-border-color': string;
  '--ui-button-shadow': string;
  '--ui-button-active-shadow': string;
  '--ui-button-active-translate': string;
  '--ui-button-weight': string;
  '--ui-input-bg': string;
  '--ui-input-radius': string;
  '--ui-input-border-width': string;
  '--ui-input-border-color': string;
  '--ui-input-shadow': string;
  '--ui-nav-bg': string;
  '--ui-nav-border': string;
  '--ui-nav-backdrop': string;
  '--ui-nav-shadow': string;
  '--ui-divider-color': string;
  '--ui-divider-width': string;
  '--ui-surface-bg': string;
  '--ui-heading-weight': string;
  '--ui-heading-tracking': string;
  '--ui-transition': string;
  '--ui-page-bg': string;
}
