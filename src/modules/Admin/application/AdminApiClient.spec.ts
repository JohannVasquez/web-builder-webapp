import { z } from 'zod';
import { AdminApiClient, AdminApiError } from './AdminApiClient';

const jsonResponse = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('AdminApiClient', () => {
  it('un 409 por dirección ocupada trae la sugerencia de la API', async () => {
    const fetchFn = jest.fn().mockResolvedValue(
      jsonResponse(409, {
        error: 'Conflict',
        message: 'Ya existe una demo en "demo-luna".',
        suggestedSlug: 'luna-2',
      }),
    );
    const client = new AdminApiClient('http://api', () => 't', fetchFn);

    const failure = await client
      .post('/api/admin/demos', {}, z.unknown())
      .catch((cause: unknown) => cause);

    expect(failure).toBeInstanceOf(AdminApiError);
    expect(failure).toMatchObject({
      status: 409,
      message: 'Ya existe una demo en "demo-luna".',
      suggestedSlug: 'luna-2',
    });
  });

  it('sin sugerencia deja el campo en nulo', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValue(jsonResponse(422, { error: 'X', message: 'No se puede.' }));
    const client = new AdminApiClient('http://api', () => 't', fetchFn);

    const failure = await client.get('/x', z.unknown()).catch((cause: unknown) => cause);

    expect(failure).toMatchObject({ suggestedSlug: null, message: 'No se puede.' });
  });

  it('borrar puede llevar la confirmación en el cuerpo', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(200, { ok: true }));
    const client = new AdminApiClient('http://api', () => 't', fetchFn);

    await client.remove('/api/admin/demos/d1', { confirm: true });

    expect(fetchFn).toHaveBeenCalledWith('http://api/api/admin/demos/d1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer t', 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirm: true }),
    });
  });
});
