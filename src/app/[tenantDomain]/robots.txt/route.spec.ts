import { NextRequest } from 'next/server';

const getSettings = jest.fn();

jest.mock('@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory', () => ({
  createGlobalSettingsService: () => ({ getSettings }),
}));

import { GET } from './route';

const robots = async (): Promise<string> => {
  const response = await GET(new NextRequest('https://acme.cl/robots.txt'), {
    params: Promise.resolve({ tenantDomain: 'acme.cl' }),
  });
  return response.text();
};

describe('GET /robots.txt', () => {
  it('un sitio normal se rastrea y anuncia su sitemap', async () => {
    getSettings.mockResolvedValue({ siteUnderConstruction: '' });

    const body = await robots();

    expect(body).toContain('Allow: /');
    expect(body).toContain('Sitemap: https://acme.cl/sitemap.xml');
  });

  it('no ofrece las rutas internas de la agencia', async () => {
    getSettings.mockResolvedValue({ siteUnderConstruction: '' });

    const body = await robots();

    expect(body).toContain('Disallow: /styleguide');
    expect(body).toContain('Disallow: /brand-asset/');
  });

  it('deja fuera el carrito, el pago y el agradecimiento', async () => {
    getSettings.mockResolvedValue({ siteUnderConstruction: '' });

    const body = await robots();

    expect(body).toContain('Disallow: /tienda/carrito');
    expect(body).toContain('Disallow: /tienda/comprar');
    // La de agradecimiento lleva el detalle del pedido en la URL.
    expect(body).toContain('Disallow: /tienda/gracias');
  });

  it('un sitio en construcción se cierra entero', async () => {
    getSettings.mockResolvedValue({ siteUnderConstruction: 'true' });

    const body = await robots();

    expect(body).toContain('Disallow: /');
    expect(body).not.toContain('Allow: /');
    // Tampoco se invita a rastrear el sitemap.
    expect(body).not.toContain('Sitemap:');
  });

  it('solo el valor exacto "true" cierra el sitio: el ajuste es texto libre', async () => {
    getSettings.mockResolvedValue({ siteUnderConstruction: 'si' });

    expect(await robots()).toContain('Allow: /');
  });
});
