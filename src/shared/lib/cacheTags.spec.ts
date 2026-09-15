import { siteCacheOptions, tenantCacheTag } from './cacheTags';

describe('cacheTags', () => {
  it('normaliza el dominio para que el mismo tenant no tenga dos etiquetas', () => {
    expect(tenantCacheTag('ACME.cl')).toBe(tenantCacheTag('acme.cl'));
  });

  it('da etiquetas distintas a tenants distintos', () => {
    expect(tenantCacheTag('acme.cl')).not.toBe(tenantCacheTag('electrica.cl'));
  });

  it('respeta el máximo de 256 caracteres que acepta Next', () => {
    expect(tenantCacheTag(`${'a'.repeat(300)}.cl`).length).toBeLessThanOrEqual(256);
  });

  it('cachea y etiqueta las lecturas hechas desde el servidor', () => {
    expect(siteCacheOptions('acme.cl')).toEqual({
      cache: 'force-cache',
      next: { tags: ['t:acme.cl'], revalidate: 3600 },
    });
  });

  it('no cachea las lecturas sin dominio: son del navegador, no del servidor', () => {
    expect(siteCacheOptions(undefined)).toEqual({ cache: 'no-store' });
  });
});
