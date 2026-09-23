import { NextRequest } from 'next/server';

const getPublishedPages = jest.fn();
const listPosts = jest.fn();
const listProducts = jest.fn();
const listCategories = jest.fn();
const getStoreSettings = jest.fn();

jest.mock('@/modules/Page/infrastructure/pageServiceFactory', () => ({
  createPageService: () => ({ getPublishedPages }),
}));
jest.mock('@/modules/Blog/infrastructure/blogServiceFactory', () => ({
  createBlogService: () => ({ listPosts }),
}));
jest.mock('@/modules/Store/infrastructure/storeServiceFactory', () => ({
  createStoreService: () => ({ listProducts, listCategories, getStoreSettings }),
}));

import { GET } from './route';

const sitemap = async (): Promise<string> => {
  const response = await GET(new NextRequest('https://acme.cl/sitemap.xml'), {
    params: Promise.resolve({ tenantDomain: 'acme.cl' }),
  });
  return response.text();
};

const emptyList = { posts: [], total: 0 };
const emptyCatalog = { products: [], total: 0 };

describe('GET /sitemap.xml', () => {
  beforeEach(() => {
    getPublishedPages.mockResolvedValue([
      { slug: 'home', updatedAt: '2026-01-01T00:00:00.000Z' },
      { slug: 'nosotros', updatedAt: null },
    ]);
    listPosts.mockResolvedValue(emptyList);
    listProducts.mockResolvedValue(emptyCatalog);
    listCategories.mockResolvedValue([]);
    getStoreSettings.mockResolvedValue({ isEnabled: true });
  });

  it('lista las páginas publicadas, con la portada en la raíz', async () => {
    const xml = await sitemap();

    expect(xml).toContain('<loc>https://acme.cl/</loc>');
    expect(xml).toContain('<loc>https://acme.cl/nosotros</loc>');
    expect(xml).toContain('<lastmod>2026-01-01T00:00:00.000Z</lastmod>');
  });

  it('incluye el índice de la tienda y cada producto', async () => {
    listProducts.mockResolvedValue({
      products: [
        { slug: 'torta-chocolate', updatedAt: '2026-02-01T00:00:00.000Z' },
        { slug: 'torta-vainilla' },
      ],
      total: 2,
    });

    const xml = await sitemap();

    expect(xml).toContain('<loc>https://acme.cl/tienda</loc>');
    expect(xml).toContain('<loc>https://acme.cl/tienda/torta-chocolate</loc>');
    expect(xml).toContain('<lastmod>2026-02-01T00:00:00.000Z</lastmod>');
    // Sin `updatedAt` la entrada existe igual: el `lastmod` es opcional en el estándar.
    expect(xml).toContain('<loc>https://acme.cl/tienda/torta-vainilla</loc>');
  });

  it('ofrece el filtro por categoría, que es una URL canónica propia', async () => {
    listCategories.mockResolvedValue([{ slug: 'tortas' }, { slug: 'pan & masas' }]);

    const xml = await sitemap();

    expect(xml).toContain('<loc>https://acme.cl/tienda?categoria=tortas</loc>');
    // El `&` de una URL tiene que ir escapado o el XML no es válido.
    expect(xml).toContain('categoria=pan%20%26%20masas');
    expect(xml).not.toMatch(/categoria=pan%20&[^a]/);
  });

  it('con la tienda apagada no lista ninguna URL de tienda', async () => {
    getStoreSettings.mockResolvedValue(null);
    listProducts.mockResolvedValue({
      products: [{ slug: 'torta-chocolate' }],
      total: 1,
    });

    const xml = await sitemap();

    expect(xml).not.toContain('/tienda');
  });

  it('sin publicaciones no lista el índice del blog', async () => {
    const xml = await sitemap();

    expect(xml).not.toContain('<loc>https://acme.cl/blog</loc>');
  });

  it('agota la paginación del catálogo en vez de quedarse en la primera página', async () => {
    const page = (start: number): { products: { slug: string }[]; total: number } => ({
      products: Array.from({ length: 50 }, (_, index) => ({
        slug: `producto-${start + index}`,
      })),
      total: 51,
    });
    listProducts
      .mockResolvedValueOnce(page(1))
      .mockResolvedValueOnce({ products: [{ slug: 'producto-51' }], total: 51 });

    const xml = await sitemap();

    expect(listProducts).toHaveBeenCalledTimes(2);
    expect(xml).toContain('<loc>https://acme.cl/tienda/producto-51</loc>');
  });
});
