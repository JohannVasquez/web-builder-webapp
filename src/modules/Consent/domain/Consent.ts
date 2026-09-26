/**
 * Finalidades por las que este sitio pide permiso. Están separadas porque la Ley 21.719 no
 * admite un único "acepto": medir el tráfico y perfilar para publicidad son cosas distintas,
 * y la segunda además implica transferir datos fuera de Chile (Meta).
 */
export const CONSENT_PURPOSES = ['necessary', 'analytics', 'advertising'] as const;
export type ConsentPurpose = (typeof CONSENT_PURPOSES)[number];

// Sin ellas el sitio no funciona, así que no se piden: se informan.
export const ALWAYS_ON: readonly ConsentPurpose[] = ['necessary'];

export const OPTIONAL_PURPOSES: readonly ConsentPurpose[] = ['analytics', 'advertising'];

export const PURPOSE_LABELS: Readonly<Record<ConsentPurpose, string>> = {
  necessary: 'Necesarias',
  analytics: 'Medición',
  advertising: 'Publicidad',
};

export const PURPOSE_DESCRIPTIONS: Readonly<Record<ConsentPurpose, string>> = {
  necessary:
    'Hacen funcionar el sitio: tu carrito, tu sesión y esta misma decisión. No se pueden desactivar.',
  analytics:
    'Nos dicen qué páginas se visitan y desde dónde, para poder mejorar el sitio. No te identifican.',
  advertising:
    'Permiten medir campañas y mostrarte anuncios en otras plataformas. Implican enviar datos a terceros fuera de Chile.',
};

/**
 * Versión del texto que se le muestra a la persona. **Súbela cada vez que cambie el texto o
 * la lista de finalidades**: un consentimiento vale solo sobre lo que alguien leyó, así que
 * al cambiar la versión se vuelve a preguntar en vez de dar por aceptado algo que nadie vio.
 */
export const CONSENT_TEXT_VERSION = 'cookies-2026-09';

export interface ConsentDecision {
  readonly purposes: readonly ConsentPurpose[];
  readonly textVersion: string;
}

export const acceptAll = (): ConsentDecision => ({
  purposes: [...ALWAYS_ON, ...OPTIONAL_PURPOSES],
  textVersion: CONSENT_TEXT_VERSION,
});

export const rejectAll = (): ConsentDecision => ({
  purposes: [...ALWAYS_ON],
  textVersion: CONSENT_TEXT_VERSION,
});

export const decisionFor = (selected: readonly ConsentPurpose[]): ConsentDecision => ({
  purposes: [...ALWAYS_ON, ...OPTIONAL_PURPOSES.filter((p) => selected.includes(p))],
  textVersion: CONSENT_TEXT_VERSION,
});

export const allows = (
  decision: ConsentDecision | null,
  purpose: ConsentPurpose,
): boolean => {
  if (decision === null) {
    // Sin decisión no hay permiso: el silencio nunca es un sí.
    return ALWAYS_ON.includes(purpose);
  }
  // Una decisión tomada sobre un texto viejo no cubre el texto nuevo.
  if (decision.textVersion !== CONSENT_TEXT_VERSION) {
    return ALWAYS_ON.includes(purpose);
  }
  return decision.purposes.includes(purpose);
};

// Hay que volver a preguntar mientras no exista una decisión sobre el texto vigente.
export const needsDecision = (decision: ConsentDecision | null): boolean =>
  decision === null || decision.textVersion !== CONSENT_TEXT_VERSION;

/**
 * Cookies que dejan los rastreadores que este sitio puede cargar. Rechazar no basta con no
 * volver a cargarlos: las que ya quedaron puestas hay que borrarlas.
 */
export const TRACKER_COOKIE_PREFIXES: Readonly<
  Record<ConsentPurpose, readonly string[]>
> = {
  necessary: [],
  analytics: ['_ga', '_gid', '_gat', '__utm'],
  advertising: ['_fbp', '_fbc', '_gcl'],
};

// Dirección de la página de política de cookies que crea la API con su plantilla legal. El
// aviso solo la enlaza si esa página existe y está publicada: mandar a un 404 desde un texto
// legal es peor que no enlazar nada.
export const COOKIE_POLICY_SLUG = 'politica-de-cookies';
export const PRIVACY_POLICY_SLUG = 'politica-de-privacidad';

export const resolveCookieNoticeHref = (
  publishedPages: readonly { readonly slug: string }[]
): string | null => {
  // Si hay política de cookies publicada, enlazamos a ella porque es más precisa.
  if (publishedPages.some((p) => p.slug === COOKIE_POLICY_SLUG)) {
    return `/${COOKIE_POLICY_SLUG}`;
  }
  // Si no hay, intentamos caer a la de privacidad.
  if (publishedPages.some((p) => p.slug === PRIVACY_POLICY_SLUG)) {
    return `/${PRIVACY_POLICY_SLUG}`;
  }
  // Si ninguna existe, no enlazamos para evitar un 404.
  return null;
};
