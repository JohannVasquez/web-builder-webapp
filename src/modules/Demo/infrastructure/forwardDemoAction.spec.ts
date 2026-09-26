import { forwardDemoAction } from './forwardDemoAction';

jest.mock('@/shared/config/api', () => ({ getApiBaseUrl: () => 'http://api.interna' }));

const TOKEN = `demo_${'cd'.repeat(32)}`;
const TENANT = 'demo-luna.webbuilder.cl';

const post = (
  path: string,
  body: unknown,
  headers: Record<string, string> = {},
): Request =>
  new Request(`https://${TENANT}/demo/api/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

describe('forwardDemoAction', () => {
  it('reenvía la acción a la API con el token de la cookie y el tenant de la ruta', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValue(
        Response.json({ success: true, message: 'Mensaje enviado.' }, { status: 200 }),
      );

    const response = await forwardDemoAction({
      tenantDomain: TENANT,
      segments: ['contact'],
      request: post('contact', { name: 'Ana' }, { 'X-Tenant-Domain': 'otro.cl' }),
      demoToken: TOKEN,
      fetchFn,
    });

    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.interna/api/contact');
    expect(init.method).toBe('POST');
    expect(init.cache).toBe('no-store');
    expect(init.body).toBe(JSON.stringify({ name: 'Ana' }));
    // El tenant sale de la ruta, nunca de lo que diga la petición del navegador.
    expect(init.headers).toMatchObject({
      'X-Tenant-Domain': TENANT,
      'X-Demo-Token': TOKEN,
      'content-type': 'application/json',
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: true, message: 'Mensaje enviado.' });
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });

  it('conserva la clave de idempotencia de la compra y el estado de la API', async () => {
    const checkout = {
      order: { number: 'A-1' },
      redirectUrl: `https://${TENANT}/tienda/gracias`,
    };
    const fetchFn = jest.fn().mockResolvedValue(Response.json(checkout, { status: 201 }));

    const response = await forwardDemoAction({
      tenantDomain: TENANT,
      segments: ['store', 'checkout'],
      request: post('store/checkout', { items: [] }, { 'Idempotency-Key': 'clave-1' }),
      demoToken: TOKEN,
      fetchFn,
    });

    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.interna/api/store/checkout');
    expect(init.headers).toMatchObject({ 'idempotency-key': 'clave-1' });
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(checkout);
  });

  it('deja pasar el mensaje de error de la API para que la pantalla lo muestre', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValue(
        Response.json({ message: 'Falta la dirección.' }, { status: 400 }),
      );

    const response = await forwardDemoAction({
      tenantDomain: TENANT,
      segments: ['store', 'quote'],
      request: post('store/quote', {}),
      demoToken: TOKEN,
      fetchFn,
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: 'Falta la dirección.' });
  });

  it('sin la cookie del enlace responde 404 y no llama a la API', async () => {
    const fetchFn = jest.fn();

    const response = await forwardDemoAction({
      tenantDomain: TENANT,
      segments: ['contact'],
      request: post('contact', {}),
      demoToken: undefined,
      fetchFn,
    });

    expect(response.status).toBe(404);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('solo reenvía las acciones públicas conocidas, no cualquier ruta de la API', async () => {
    const fetchFn = jest.fn();

    for (const segments of [
      ['admin', 'tenants'],
      ['pages'],
      ['store'],
      ['..', 'admin'],
    ]) {
      const response = await forwardDemoAction({
        tenantDomain: TENANT,
        segments,
        request: post(segments.join('/'), {}),
        demoToken: TOKEN,
        fetchFn,
      });
      expect(response.status).toBe(404);
    }
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('si la API no contesta responde 502 en vez de reventar', async () => {
    const fetchFn = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

    const response = await forwardDemoAction({
      tenantDomain: TENANT,
      segments: ['newsletter'],
      request: post('newsletter', { email: 'a@b.cl' }),
      demoToken: TOKEN,
      fetchFn,
    });

    expect(response.status).toBe(502);
  });

  it('un 204 de la API se devuelve sin cuerpo', async () => {
    const fetchFn = jest.fn().mockResolvedValue(new Response(null, { status: 204 }));

    const response = await forwardDemoAction({
      tenantDomain: TENANT,
      segments: ['consents'],
      request: post('consents', {}),
      demoToken: TOKEN,
      fetchFn,
    });

    expect(response.status).toBe(204);
  });
});
