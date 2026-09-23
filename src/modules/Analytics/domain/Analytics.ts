/**
 * Ya no hay interruptor para el aviso de cookies. Lo había (`cookieBanner`, un campo de texto
 * por tenant) y su estado por omisión dejaba los rastreadores corriendo sin consentimiento,
 * que es justo lo que sanciona la Ley 21.719. Pedir permiso no es una preferencia del
 * cliente: sin él, ningún rastreador carga.
 */
export interface AnalyticsConfig {
  readonly googleAnalyticsId: string;
  readonly metaPixelId: string;
  readonly googleTagManagerId: string;
}

const GA_PATTERN = /^G-[A-Z0-9]{4,20}$/i;
const GTM_PATTERN = /^GTM-[A-Z0-9]{4,20}$/i;
const PIXEL_PATTERN = /^\d{6,20}$/;

// Los ids salen de un campo de texto que llena una persona: si están mal, se ignoran en vez
// de inyectar un script roto (o, peor, lo que alguien haya pegado ahí).
export const readAnalyticsConfig = (settings: {
  googleAnalyticsId: string;
  metaPixelId: string;
  googleTagManagerId: string;
}): AnalyticsConfig => ({
  googleAnalyticsId: GA_PATTERN.test(settings.googleAnalyticsId)
    ? settings.googleAnalyticsId
    : '',
  metaPixelId: PIXEL_PATTERN.test(settings.metaPixelId) ? settings.metaPixelId : '',
  googleTagManagerId: GTM_PATTERN.test(settings.googleTagManagerId)
    ? settings.googleTagManagerId
    : '',
});

export const hasAnyTracker = (config: AnalyticsConfig): boolean =>
  config.googleAnalyticsId !== '' ||
  config.metaPixelId !== '' ||
  config.googleTagManagerId !== '';
