import { ContactService } from './ContactService';
import type { ContactInput } from '../domain/ContactSchema';

describe('ContactService', () => {
  const validInput: ContactInput = {
    name: 'Johann Vasquez',
    email: 'johann@example.com',
    message: 'Quiero más información sobre sus servicios.',
  };

  const buildResponse = (status: number, body: unknown): Response =>
    ({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(body),
    }) as Response;

  it('posts the validated payload to the API and returns the result', async () => {
    const fetchFn = jest
      .fn<Promise<Response>, [string, RequestInit?]>()
      .mockResolvedValue(
        buildResponse(200, { success: true, message: 'Enviado con éxito' }),
      );
    const service = new ContactService('http://api.test', fetchFn);

    const result = await service.sendContact(validInput);

    expect(fetchFn).toHaveBeenCalledWith(
      'http://api.test/api/contact',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(result).toEqual({ success: true, message: 'Enviado con éxito' });
  });

  it('rejects invalid input locally without calling the API', async () => {
    const fetchFn = jest.fn<Promise<Response>, [string, RequestInit?]>();
    const service = new ContactService('http://api.test', fetchFn);

    await expect(
      service.sendContact({ ...validInput, email: 'invalido' }),
    ).rejects.toThrow();
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('throws when the API responds with an error status', async () => {
    const fetchFn = jest
      .fn<Promise<Response>, [string, RequestInit?]>()
      .mockResolvedValue(buildResponse(500, {}));
    const service = new ContactService('http://api.test', fetchFn);

    await expect(service.sendContact(validInput)).rejects.toThrow('HTTP 500');
  });
});
