import { hasAnyTracker, readAnalyticsConfig } from './Analytics';

describe('readAnalyticsConfig', () => {
  const empty = {
    googleAnalyticsId: '',
    metaPixelId: '',
    googleTagManagerId: '',
  };

  it('sin configuración no hay ningún rastreador', () => {
    expect(hasAnyTracker(readAnalyticsConfig(empty))).toBe(false);
  });

  it('acepta ids con el formato de cada plataforma', () => {
    const config = readAnalyticsConfig({
      ...empty,
      googleAnalyticsId: 'G-ABC1234567',
      googleTagManagerId: 'GTM-ABC1234',
      metaPixelId: '1234567890123',
    });

    expect(config.googleAnalyticsId).toBe('G-ABC1234567');
    expect(config.googleTagManagerId).toBe('GTM-ABC1234');
    expect(config.metaPixelId).toBe('1234567890123');
  });

  it('descarta un id con formato inválido en vez de inyectarlo', () => {
    const config = readAnalyticsConfig({
      ...empty,
      googleAnalyticsId: 'UA-12345',
      googleTagManagerId: 'no-es-un-id',
      metaPixelId: 'abc',
    });

    expect(hasAnyTracker(config)).toBe(false);
  });

  it('no deja pasar algo que parece un script pegado en el campo', () => {
    const config = readAnalyticsConfig({
      ...empty,
      googleAnalyticsId: "G-X');alert(1);//",
    });

    expect(config.googleAnalyticsId).toBe('');
  });

  // El interruptor del aviso de cookies se eliminó a propósito: su estado por omisión dejaba
  // los rastreadores corriendo sin consentimiento. Ahora quien decide es `ConsentProvider`.
  it('la configuración ya no incluye un interruptor para el aviso', () => {
    expect(readAnalyticsConfig(empty)).not.toHaveProperty('cookieBannerEnabled');
  });
});
