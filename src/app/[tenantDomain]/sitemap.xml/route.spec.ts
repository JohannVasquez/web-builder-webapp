import { NextRequest } from 'next/server';

const getPublishedPages = jest.fn();
const listPosts = jest.fn();
const getSettings = jest.fn();

jest.mock('@/modules/Page/infrastructure/pageServiceFactory', () => ({
  createPageService: () => ({ getPublishedPages }),
}));
jest.mock('@/modules/Blog/infrastructure/blogServiceFactory', () => ({
  createBlogService: () => ({ listPosts }),
}));
jest.mock('@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory', () => ({
  createGlobalSettingsService: () => ({ getSettings }),
}));

import { GET } from './route';

const sitemap = async (): Promise<string> => {
  const response = await GET(new NextRequest('https://acme.cl/sitemap.xml'), {
    params: Promise.resolve({ tenantDomain: 'acme.cl' }),
  });
  return response.text();
};

describe('GET /sitemap.xml', () => {
  beforeEach(() => {
    getSettings.mockResolvedValue({ siteUnderConstruction: '' });
    getPublishedPages.mockResolvedValue([
      { slug: 'home', updatedAt: '2026-01-01T00:00:00.000Z' },
      { slug: 'nosotros', updatedAt: null },
    ]);
    listPosts.mockResolvedValue({ posts: [], total: 0 });
  });

  it('lista las páginas publicadas, con la portada en la raíz', async () => {
    const xml = await sitemap();

    expect(xml).toContain('<loc>https://acme.cl/</loc>');
    expect(xml).toContain('<loc>https://acme.cl/nosotros</loc>');
  });

  it('no lista lo que la propia página pide no indexar', async () => {
    // Un sitemap que lista una URL `noindex` son dos señales contradictorias.
    getPublishedPages.mockResolvedValue([
      { slug: 'home', updatedAt: null },
      { slug: 'gracias-por-escribir', updatedAt: null, noindex: true },
    ]);

    const xml = await sitemap();

    expect(xml).toContain('<loc>https://acme.cl/</loc>');
    expect(xml).not.toContain('gracias-por-escribir');
  });

  it('sin el dato, la página se lista: ausente no es lo mismo que excluida', async () => {
    const xml = await sitemap();

    expect(xml).toContain('<loc>https://acme.cl/nosotros</loc>');
  });

  it('deja fuera las publicaciones marcadas como no indexables', async () => {
    listPosts.mockResolvedValue({
      posts: [
        { slug: 'visible', publishedAt: '2026-01-05T00:00:00.000Z' },
        { slug: 'oculta', publishedAt: '2026-01-06T00:00:00.000Z', noindex: true },
      ],
      total: 2,
    });

    const xml = await sitemap();

    expect(xml).toContain('/blog/visible');
    expect(xml).not.toContain('/blog/oculta');
  });

  it('un sitio en construcción no lista nada', async () => {
    getSettings.mockResolvedValue({ siteUnderConstruction: 'true' });

    const xml = await sitemap();

    expect(xml).not.toContain('<loc>');
    // Sigue siendo un sitemap válido, para que el cliente vea que está vacío a propósito.
    expect(xml).toContain('<urlset');
  });
});
