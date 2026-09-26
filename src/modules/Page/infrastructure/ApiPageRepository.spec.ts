import { cookies } from 'next/headers';
import { ApiPageRepository } from './ApiPageRepository';

jest.mock('next/headers', () => ({
  draftMode: jest.fn().mockResolvedValue({ isEnabled: false }),
  cookies: jest.fn(),
}));

const DEMO_TOKEN = `demo_${'5a'.repeat(32)}`;

const NO_PAGES = { pages: [] };

describe('ApiPageRepository en una demo de prospecto', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn().mockResolvedValue(Response.json(NO_PAGES));
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('con la cookie del enlace reenvía el token, junto al tenant, sin caché compartida', async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: (name: string) =>
        name === 'demo_token' ? { name, value: DEMO_TOKEN } : undefined,
    });

    await new ApiPageRepository(
      'http://api',
      'demo-luna.webbuilder.cl',
    ).findAllPublished();

    const [, init] = fetchMock.mock.calls[0] as [
      string,
      RequestInit & { next?: unknown },
    ];
    expect(init.headers).toEqual({
      'X-Demo-Token': DEMO_TOKEN,
      'X-Tenant-Domain': 'demo-luna.webbuilder.cl',
    });
    expect(init.cache).toBe('no-store');
    expect(init.next).toBeUndefined();
  });

  it('si la demo vence a mitad de la visita (404 de la API) la página no existe', async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: () => ({ name: 'demo_token', value: DEMO_TOKEN }),
    });
    fetchMock.mockResolvedValue(new Response('{"error":"Not found"}', { status: 404 }));

    const page = await new ApiPageRepository(
      'http://api',
      'demo-luna.webbuilder.cl',
    ).findBySlug('home');

    expect(page).toBeNull();
  });

  it('un cliente normal sigue usando la caché etiquetada y no manda token', async () => {
    (cookies as jest.Mock).mockResolvedValue({ get: () => undefined });

    await new ApiPageRepository('http://api', 'acme.cl').findAllPublished();

    const [, init] = fetchMock.mock.calls[0] as [
      string,
      RequestInit & { next?: unknown },
    ];
    expect(init.headers).toEqual({ 'X-Tenant-Domain': 'acme.cl' });
    expect(init.cache).toBe('force-cache');
    expect(init.next).toEqual({ tags: ['t:acme.cl'], revalidate: 3600 });
  });
});
