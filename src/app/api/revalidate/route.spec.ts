import { NextRequest } from 'next/server';
import { revalidateTag } from 'next/cache';
import { POST } from './route';

jest.mock('next/cache', () => ({ revalidateTag: jest.fn() }));

const mockedRevalidateTag = revalidateTag as jest.MockedFunction<typeof revalidateTag>;

describe('POST /api/revalidate', () => {
  const SECRET = 'secreto-de-pruebas';
  const originalSecret = process.env.REVALIDATE_SECRET;

  beforeEach(() => {
    process.env.REVALIDATE_SECRET = SECRET;
  });

  afterAll(() => {
    process.env.REVALIDATE_SECRET = originalSecret;
  });

  const post = (body: unknown, secret: string | null = SECRET): Promise<Response> =>
    POST(
      new NextRequest('http://web.test/api/revalidate', {
        method: 'POST',
        headers: secret === null ? {} : { 'x-revalidate-secret': secret },
        body: JSON.stringify(body),
      }),
    );

  it('invalida solo las etiquetas de los dominios pedidos', async () => {
    const response = await post({ domains: ['acme.cl', 'acme.webbuilder.co'] });

    expect(response.status).toBe(200);
    expect(mockedRevalidateTag.mock.calls.map(([tag]) => tag)).toEqual([
      't:acme.cl',
      't:acme.webbuilder.co',
    ]);
  });

  it('expira de inmediato en vez de servir contenido viejo una vez más', async () => {
    await post({ domains: ['acme.cl'] });

    expect(mockedRevalidateTag).toHaveBeenCalledWith('t:acme.cl', { expire: 0 });
  });

  it('invalidar un tenant no toca la caché de otro', async () => {
    await post({ domains: ['acme.cl'] });

    const tags = mockedRevalidateTag.mock.calls.map(([tag]) => tag);
    expect(tags).not.toContain('t:electrica.cl');
  });

  it('rechaza una petición sin el secreto compartido', async () => {
    const response = await post({ domains: ['acme.cl'] }, null);

    expect(response.status).toBe(401);
    expect(mockedRevalidateTag).not.toHaveBeenCalled();
  });

  it('rechaza un secreto incorrecto', async () => {
    const response = await post({ domains: ['acme.cl'] }, 'otro-secreto-cualquiera');

    expect(response.status).toBe(401);
    expect(mockedRevalidateTag).not.toHaveBeenCalled();
  });

  it('rechaza todo cuando el secreto no está configurado', async () => {
    process.env.REVALIDATE_SECRET = '';

    const response = await post({ domains: ['acme.cl'] }, '');

    expect(response.status).toBe(401);
  });

  it('rechaza un cuerpo con forma inesperada', async () => {
    const response = await post({ dominios: 'acme.cl' });

    expect(response.status).toBe(400);
    expect(mockedRevalidateTag).not.toHaveBeenCalled();
  });
});
