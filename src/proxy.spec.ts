import { NextRequest } from 'next/server';
import { proxy } from './proxy';

const TOKEN = `demo_${'ab'.repeat(32)}`;
const DEMO_HOST = 'demo-luna.webbuilder.cl';

const request = (url: string, cookie?: string): NextRequest =>
  new NextRequest(url, cookie === undefined ? undefined : { headers: { cookie } });

const apiResponds = (status: number, headers: Record<string, string> = {}): jest.Mock => {
  const fetchMock = jest.fn().mockResolvedValue(new Response('{}', { status, headers }));
  global.fetch = fetchMock;
  return fetchMock;
};

const rewrittenTo = (response: Response): string | null => {
  const target = response.headers.get('x-middleware-rewrite');
  return target === null ? null : new URL(target).pathname;
};

describe('proxy', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('canje del enlace mágico /demo/<token>', () => {
    it('con un token válido deja la cookie y manda a la portada, sin el token en la URL', async () => {
      const fetchMock = apiResponds(200, { 'X-Demo': 'true' });

      const response = await proxy(request(`https://${DEMO_HOST}/demo/${TOKEN}`));

      expect(response.status).toBe(307);
      expect(new URL(response.headers.get('location') ?? '').pathname).toBe('/');
      expect(response.headers.get('location')).not.toContain(TOKEN);

      const setCookie = response.headers.get('set-cookie') ?? '';
      expect(setCookie).toContain(`demo_token=${TOKEN}`);
      expect(setCookie).toContain('Path=/');
      expect(setCookie).toMatch(/HttpOnly/i);
      expect(setCookie).toMatch(/SameSite=lax/i);
      // Sin `Domain`: la cookie queda atada al host exacto de la demo.
      expect(setCookie).not.toMatch(/Domain=/i);

      // Se valida contra la API con el token en su header y sin caché.
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      expect(url).toMatch(/\/api\/settings$/);
      expect(init.cache).toBe('no-store');
      expect(init.headers).toMatchObject({
        'X-Tenant-Domain': DEMO_HOST,
        'X-Demo-Token': TOKEN,
      });
    });

    it('la redirección del canje tampoco se cachea ni se indexa', async () => {
      apiResponds(200, { 'X-Demo': 'true' });

      const response = await proxy(request(`https://${DEMO_HOST}/demo/${TOKEN}`));

      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    });

    it('si la API no lo acepta (vencido, de otra demo, descartado) se ve el 404 normal', async () => {
      apiResponds(404);

      const response = await proxy(request(`https://${DEMO_HOST}/demo/${TOKEN}`));

      expect(rewrittenTo(response)).toBe(`/${DEMO_HOST}/demo/invalido`);
      expect(response.headers.get('set-cookie')).toBeNull();
    });

    it('un token con otra forma es 404 sin siquiera preguntarle a la API', async () => {
      const fetchMock = apiResponds(200, { 'X-Demo': 'true' });

      const response = await proxy(request(`https://${DEMO_HOST}/demo/no-es-un-token`));

      expect(fetchMock).not.toHaveBeenCalled();
      expect(rewrittenTo(response)).toBe(`/${DEMO_HOST}/demo/invalido`);
      expect(response.headers.get('set-cookie')).toBeNull();
    });

    it('si la API responde sin X-Demo (un cliente normal) no se canjea nada', async () => {
      apiResponds(200);

      const response = await proxy(request(`https://acme.cl/demo/${TOKEN}`));

      expect(rewrittenTo(response)).toBe('/acme.cl/demo/invalido');
      expect(response.headers.get('set-cookie')).toBeNull();
    });

    it('si la API no contesta también es 404, no un error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

      const response = await proxy(request(`https://${DEMO_HOST}/demo/${TOKEN}`));

      expect(rewrittenTo(response)).toBe(`/${DEMO_HOST}/demo/invalido`);
    });

    it('las acciones del navegador en /demo/api/... no son un canje', async () => {
      const fetchMock = apiResponds(200, { 'X-Demo': 'true' });

      const response = await proxy(request(`https://${DEMO_HOST}/demo/api/contact`));

      expect(fetchMock).not.toHaveBeenCalled();
      expect(rewrittenTo(response)).toBe(`/${DEMO_HOST}/demo/api/contact`);
    });
  });

  describe('cabeceras de una demo', () => {
    it('todo lo de un host demo-* sale sin caché y con noindex, aunque no traiga cookie', async () => {
      const response = await proxy(request(`https://${DEMO_HOST}/`));

      expect(rewrittenTo(response)).toBe(`/${DEMO_HOST}`);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    });

    it('con la cookie del enlace también, sea cual sea el host', async () => {
      const response = await proxy(
        request('https://acme.cl/nosotros', `demo_token=${TOKEN}`),
      );

      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(response.headers.get('x-robots-tag')).toBe('noindex, nofollow');
    });

    it('un cliente normal no recibe nada de eso', async () => {
      const response = await proxy(request('https://acme.cl/nosotros'));

      expect(rewrittenTo(response)).toBe('/acme.cl/nosotros');
      expect(response.headers.get('cache-control')).toBeNull();
      expect(response.headers.get('x-robots-tag')).toBeNull();
    });
  });

  describe('precarga de enlaces en una demo', () => {
    const prefetch = (url: string, cookie?: string): NextRequest =>
      new NextRequest(url, {
        headers: {
          'next-router-prefetch': '1',
          rsc: '1',
          ...(cookie === undefined ? {} : { cookie }),
        },
      });

    it('no se renderiza: la API la contaría como una visita del prospecto', async () => {
      const response = await proxy(
        prefetch(`https://${DEMO_HOST}/nosotros`, `demo_token=${TOKEN}`),
      );

      expect(response.status).toBe(204);
      expect(rewrittenTo(response)).toBeNull();
      expect(response.headers.get('cache-control')).toBe('private, no-store');
    });

    it('la navegación real a la misma página sí se sirve', async () => {
      const response = await proxy(
        new NextRequest(`https://${DEMO_HOST}/nosotros`, {
          headers: { rsc: '1', cookie: `demo_token=${TOKEN}` },
        }),
      );

      expect(rewrittenTo(response)).toBe(`/${DEMO_HOST}/nosotros`);
    });

    it('un cliente normal sigue precargando', async () => {
      const response = await proxy(prefetch('https://acme.cl/nosotros'));

      expect(rewrittenTo(response)).toBe('/acme.cl/nosotros');
    });
  });
});
