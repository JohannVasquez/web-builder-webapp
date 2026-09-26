/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import UnsubscribePage from './page';

// Mock getApiBaseUrl
jest.mock('@/shared/config/api', () => ({
  getApiBaseUrl: () => 'http://localhost:8080',
}));

describe('UnsubscribePage', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('shows success message when unsubscription is successful (idempotent)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
    });

    const Page = await UnsubscribePage({ params: Promise.resolve({ token: 'valid-token' }) });
    render(Page);

    expect(screen.getByText('Listo, te diste de baja')).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8080/api/newsletter-baja/valid-token',
      {
        method: 'POST',
        cache: 'no-store',
      },
    );
  });

  it('shows error message for invalid/failing token', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
    });

    const Page = await UnsubscribePage({ params: Promise.resolve({ token: 'invalid-token' }) });
    render(Page);

    expect(screen.getByText('No pudimos procesar tu baja')).toBeInTheDocument();
    expect(
      screen.getByText(/El enlace puede haber caducado o estar incompleto/),
    ).toBeInTheDocument();
  });

  it('shows error message if fetch throws (network error)', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const Page = await UnsubscribePage({ params: Promise.resolve({ token: 'some-token' }) });
    render(Page);

    expect(screen.getByText('No pudimos procesar tu baja')).toBeInTheDocument();
  });
});
