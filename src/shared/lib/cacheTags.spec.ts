import { cookies, headers } from 'next/headers';
import { siteCacheOptions, tenantCacheTag } from './cacheTags';

jest.mock('next/headers', () => ({
  draftMode: jest.fn().mockResolvedValue({ isEnabled: false }),
  cookies: jest.fn().mockResolvedValue({ get: jest.fn() }),
  headers: jest.fn().mockResolvedValue({ get: () => null }),
}));

const DEMO_TOKEN = `demo_${'0f'.repeat(32)}`;

// Simula la cookie que deja el canje de `/demo/<token>`.
const withCookies = (values: Record<string, string>): void => {
  (cookies as jest.Mock).mockResolvedValue({
    get: (name: string) => (name in values ? { name, value: values[name] } : undefined),
  });
};

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

  describe('demo de prospecto', () => {
    beforeEach(() => {
      withCookies({});
    });

    it('con la cookie del enlace reenvía el token y nunca usa la caché compartida', async () => {
      withCookies({ demo_token: DEMO_TOKEN });

      const options = await siteCacheOptions('demo-luna.webbuilder.cl');

      expect(options).toEqual({
        cache: 'no-store',
        headers: { 'X-Demo-Token': DEMO_TOKEN },
      });
      // Sin etiquetas: una demo jamás puede quedar en la caché del servidor.
      expect(options.next).toBeUndefined();
    });

    it('reenvía el agente de usuario de quien mira: la API lo anota en la visita', async () => {
      withCookies({ demo_token: DEMO_TOKEN });
      (headers as jest.Mock).mockResolvedValueOnce({
        get: (name: string) =>
          name === 'user-agent'
            ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Mobile'
            : null,
      });

      expect(await siteCacheOptions('demo-luna.webbuilder.cl')).toEqual({
        cache: 'no-store',
        headers: {
          'X-Demo-Token': DEMO_TOKEN,
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Mobile',
        },
      });
    });

    it('la cookie manda aunque el host no parezca de demo', async () => {
      withCookies({ demo_token: DEMO_TOKEN });

      expect(await siteCacheOptions('acme.cl')).toEqual({
        cache: 'no-store',
        headers: { 'X-Demo-Token': DEMO_TOKEN },
      });
    });

    it('en un host demo-* no cachea aunque no haya cookie (ni el 404 de quien no tiene enlace)', async () => {
      expect(await siteCacheOptions('demo-luna.webbuilder.cl')).toEqual({
        cache: 'no-store',
      });
    });

    it('ignora una cookie con otra forma: un cliente normal sigue cacheando', async () => {
      withCookies({ demo_token: 'cualquier-cosa' });

      expect(await siteCacheOptions('acme.cl')).toEqual({
        cache: 'force-cache',
        next: { tags: ['t:acme.cl'], revalidate: 3600 },
      });
    });
  });
});
