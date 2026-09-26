/** @jest-environment jsdom */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { SiteApiBaseUrlProvider } from '@/shared/lib/useSiteApiBaseUrl';
import { Newsletter } from './Newsletter';

jest.mock('@/shared/config/api', () => ({
  getPublicApiBaseUrl: () => 'https://api.publica',
}));

// `RevealOnScroll` usa IntersectionObserver, que jsdom no trae.
class NoopObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

describe('Newsletter: a dónde va la suscripción', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    Object.assign(window, { IntersectionObserver: NoopObserver });
    fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 201 });
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const firstCall = (): [string, RequestInit] =>
    fetchMock.mock.calls[0] as [string, RequestInit];

  const subscribe = async (): Promise<void> => {
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'ana@ejemplo.cl');
    await userEvent.click(screen.getByRole('button', { name: /suscribirme/i }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  };

  it('en un sitio normal sale directo a la API pública', async () => {
    render(<Newsletter sectionProps={{ title: 'Novedades' }} />);

    await subscribe();

    expect(firstCall()[0]).toBe('https://api.publica/api/newsletter');
  });

  it('en una demo pasa por el servidor del sitio, que agrega el token de la cookie', async () => {
    render(
      <SiteApiBaseUrlProvider baseUrl="/demo">
        <Newsletter sectionProps={{ title: 'Novedades' }} />
      </SiteApiBaseUrlProvider>,
    );

    await subscribe();

    const [url, init] = firstCall();
    expect(url).toBe('/demo/api/newsletter');
    // El token nunca lo pone el navegador: la cookie es httpOnly.
    expect(JSON.stringify(init.headers)).not.toMatch(/demo-token/i);
  });
});
