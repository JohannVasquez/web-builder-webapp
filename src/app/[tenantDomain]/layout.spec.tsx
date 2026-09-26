import { renderToStaticMarkup } from 'react-dom/server';
import { cookies } from 'next/headers';
import { DEFAULT_GLOBAL_SETTINGS } from '@/modules/GlobalSettings/domain/GlobalSettings';

// Una demo de prospecto nunca entra a un buscador. El `robots` del metadata del layout no
// basta: una página que declara el suyo (aunque sea `undefined`) lo pisa. Por eso el layout
// además pinta la etiqueta, y estas pruebas cuidan las dos cosas.

jest.mock('next/headers', () => ({
  draftMode: jest.fn().mockResolvedValue({ isEnabled: false }),
  cookies: jest.fn().mockResolvedValue({ get: () => undefined }),
}));

jest.mock(
  'next/font/google',
  () =>
    new Proxy(
      {},
      { get: () => () => ({ variable: 'font-stub', className: 'font-stub' }) },
    ),
);

const getSettings = jest.fn();

jest.mock('@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory', () => ({
  createGlobalSettingsService: () => ({ getSettings }),
}));
jest.mock('@/modules/Navigation/infrastructure/navigationServiceFactory', () => ({
  createNavigationService: () => ({ getLinks: jest.fn().mockResolvedValue([]) }),
}));
jest.mock('@/modules/Store/infrastructure/storeServiceFactory', () => ({
  createStoreService: () => ({ getStoreSettings: jest.fn().mockResolvedValue(null) }),
}));
jest.mock('@/modules/Page/infrastructure/pageServiceFactory', () => ({
  createPageService: () => ({ getPublishedPages: jest.fn().mockResolvedValue([]) }),
}));

import TenantLayout, { generateMetadata } from './layout';

const DEMO_TOKEN = `demo_${'9e'.repeat(32)}`;
const NOINDEX_META = '<meta name="robots" content="noindex, nofollow"/>';

const params = (tenantDomain: string): { params: Promise<{ tenantDomain: string }> } => ({
  params: Promise.resolve({ tenantDomain }),
});

const renderLayout = async (tenantDomain: string): Promise<string> =>
  renderToStaticMarkup(
    await TenantLayout({ children: <p>contenido</p>, ...params(tenantDomain) }),
  );

describe('layout de tenant en una demo de prospecto', () => {
  beforeEach(() => {
    getSettings.mockResolvedValue(DEFAULT_GLOBAL_SETTINGS);
    (cookies as jest.Mock).mockResolvedValue({ get: () => undefined });
  });

  it('un host demo-* lleva noindex en el metadata y en la etiqueta', async () => {
    const metadata = await generateMetadata(params('demo-luna.webbuilder.cl'));

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(await renderLayout('demo-luna.webbuilder.cl')).toContain(NOINDEX_META);
  });

  it('si la API responde con X-Demo: true también, sea cual sea el host', async () => {
    getSettings.mockResolvedValue({ ...DEFAULT_GLOBAL_SETTINGS, servedAsDemo: true });

    const metadata = await generateMetadata(params('luna.webbuilder.cl'));

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(await renderLayout('luna.webbuilder.cl')).toContain(NOINDEX_META);
  });

  it('con la cookie del enlace también', async () => {
    (cookies as jest.Mock).mockResolvedValue({
      get: (name: string) =>
        name === 'demo_token' ? { name, value: DEMO_TOKEN } : undefined,
    });

    expect(await renderLayout('luna.webbuilder.cl')).toContain(NOINDEX_META);
  });

  it('no muestra ninguna franja de propuesta: el vendedor lo dice en la llamada', async () => {
    const html = await renderLayout('demo-luna.webbuilder.cl');

    expect(html).not.toMatch(/propuesta/i);
    expect(html).not.toMatch(/vista previa/i);
  });

  it('un cliente normal no lleva noindex', async () => {
    const metadata = await generateMetadata(params('acme.cl'));

    expect(metadata.robots).toBeUndefined();
    expect(await renderLayout('acme.cl')).not.toContain('name="robots"');
  });
});
