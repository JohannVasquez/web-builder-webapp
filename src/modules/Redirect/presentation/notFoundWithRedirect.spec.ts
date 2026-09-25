import { notFound, permanentRedirect } from 'next/navigation';
import { notFoundWithRedirect } from './notFoundWithRedirect';
import type { RedirectService } from '../application/RedirectService';
import type { Redirect } from '../domain/Redirect';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  permanentRedirect: jest.fn((_url) => {
    throw new Error('NEXT_REDIRECT');
  }),
}));

describe('notFoundWithRedirect', () => {
  let redirectService: jest.Mocked<RedirectService>;

  beforeEach(() => {
    jest.clearAllMocks();
    redirectService = {
      resolve: jest.fn(),
    } as unknown as jest.Mocked<RedirectService>;
  });

  it('redirecciona permanentemente si la API devuelve una redirección', async () => {
    const redirect: Redirect = {
      id: '1',
      fromPath: '/vieja',
      toPath: '/nueva',
      statusCode: 301,
      createdAt: new Date().toISOString(),
    };
    redirectService.resolve.mockResolvedValueOnce(redirect);

    await expect(notFoundWithRedirect(redirectService, '/vieja')).rejects.toThrow('NEXT_REDIRECT');
    expect(permanentRedirect).toHaveBeenCalledWith('/nueva');
    expect(notFound).not.toHaveBeenCalled();
    expect(redirectService.resolve).toHaveBeenCalledWith('/vieja');
  });

  it('responde 404 si la API no devuelve una redirección', async () => {
    redirectService.resolve.mockResolvedValueOnce(null);

    await expect(notFoundWithRedirect(redirectService, '/no-existe')).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
    expect(permanentRedirect).not.toHaveBeenCalled();
    expect(redirectService.resolve).toHaveBeenCalledWith('/no-existe');
  });
});
