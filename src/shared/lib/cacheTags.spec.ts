import { siteCacheOptions, tenantCacheTag } from './cacheTags';

jest.mock('next/headers', () => ({
  draftMode: jest.fn().mockResolvedValue({ isEnabled: false }),
  cookies: jest.fn().mockResolvedValue({ get: jest.fn() }),
}));

describe('cacheTags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normaliza el dominio para que el mismo tenant no tenga dos etiquetas', () => {
    expect(tenantCacheTag('ACME.cl')).toBe(tenantCacheTag('acme.cl'));
  });

  it('da etiquetas distintas a tenants distintos', () => {
    expect(tenantCacheTag('acme.cl')).not.toBe(tenantCacheTag('electrica.cl'));
  });

  it('respeta el máximo de 256 caracteres que acepta Next', () => {
    expect(tenantCacheTag(`${'a'.repeat(300)}.cl`).length).toBeLessThanOrEqual(256);
  });

  it('cachea y etiqueta las lecturas hechas desde el servidor', async () => {
    expect(await siteCacheOptions('acme.cl')).toEqual({
      cache: 'force-cache',
      next: { tags: ['t:acme.cl'], revalidate: 3600 },
    });
  });

  it('no cachea las lecturas sin dominio: son del navegador, no del servidor', async () => {
    expect(await siteCacheOptions(undefined)).toEqual({ cache: 'no-store' });
  });
});
