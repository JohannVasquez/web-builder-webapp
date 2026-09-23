import type { Metadata } from 'next';

// Cada ruta pública tiene que declarar SU canónico. Hasta septiembre de 2026 el layout de
// tenant fijaba `canonical: '/'`, y como el metadata de Next se hereda, cada post y cada
// producto señalaba a la portada como su versión buena: el buscador los descartaba a todos.
// Estas pruebas existen para que esa regresión no vuelva sin que nadie se entere.

// `next/font/google` solo existe dentro del compilador de Next; fuera de él, cualquier
// fuente devuelve lo mismo, que es todo lo que necesita el layout para construirse.
jest.mock(
  'next/font/google',
  () =>
    new Proxy(
      {},
      { get: () => () => ({ variable: 'font-stub', className: 'font-stub' }) },
    ),
);

const getPage = jest.fn();
const getPublishedPages = jest.fn();
const getPost = jest.fn();
const listPosts = jest.fn();
const getProduct = jest.fn();
const listProducts = jest.fn();
const listCategories = jest.fn();
const getStoreSettings = jest.fn();
const getSettings = jest.fn();

jest.mock('@/modules/Page/infrastructure/pageServiceFactory', () => ({
  createPageService: () => ({ getPage, getPublishedPages }),
}));
jest.mock('@/modules/Blog/infrastructure/blogServiceFactory', () => ({
  createBlogService: () => ({ getPost, listPosts }),
}));
jest.mock('@/modules/Store/infrastructure/storeServiceFactory', () => ({
  createStoreService: () => ({
    getProduct,
    listProducts,
    listCategories,
    getStoreSettings,
  }),
}));
jest.mock('@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory', () => ({
  createGlobalSettingsService: () => ({ getSettings }),
}));

const SETTINGS = {
  siteName: 'Pastelería Acme',
  tagline: 'Tortas a pedido',
  primaryDomain: 'acme.cl',
};

const canonicalOf = (metadata: Metadata): unknown => metadata.alternates?.canonical;

describe('canónico por ruta', () => {
  beforeEach(() => {
    getSettings.mockResolvedValue(SETTINGS);
  });

  it('la portada es canónica de sí misma', async () => {
    getPage.mockResolvedValue({ title: 'Inicio', description: 'Bienvenido' });
    const { generateMetadata } = await import('./[tenantDomain]/[[...slug]]/page');

    const metadata = await generateMetadata({
      params: Promise.resolve({ tenantDomain: 'acme.cl', slug: undefined }),
    });

    expect(canonicalOf(metadata)).toBe('/');
  });

  it('una página interna apunta a su propia ruta, no a la portada', async () => {
    getPage.mockResolvedValue({ title: 'Nosotros', description: 'Quiénes somos' });
    const { generateMetadata } = await import('./[tenantDomain]/[[...slug]]/page');

    const metadata = await generateMetadata({
      params: Promise.resolve({ tenantDomain: 'acme.cl', slug: ['nosotros'] }),
    });

    expect(canonicalOf(metadata)).toBe('/nosotros');
  });

  it('una página anidada conserva todos sus segmentos', async () => {
    getPage.mockResolvedValue({ title: 'Tortas', description: 'Catálogo' });
    const { generateMetadata } = await import('./[tenantDomain]/[[...slug]]/page');

    const metadata = await generateMetadata({
      params: Promise.resolve({ tenantDomain: 'acme.cl', slug: ['servicios', 'tortas'] }),
    });

    expect(canonicalOf(metadata)).toBe('/servicios/tortas');
  });

  it('una publicación apunta a su propia URL', async () => {
    getPost.mockResolvedValue({
      title: 'Cómo elegir una torta',
      excerpt: 'Guía breve',
      seoTitle: null,
      seoDescription: null,
      ogImageUrl: null,
      coverImageUrl: null,
      publishedAt: '2026-01-15T00:00:00.000Z',
    });
    const { generateMetadata } = await import('./[tenantDomain]/blog/[slug]/page');

    const metadata = await generateMetadata({
      params: Promise.resolve({ tenantDomain: 'acme.cl', slug: 'elegir-torta' }),
    });

    expect(canonicalOf(metadata)).toBe('/blog/elegir-torta');
  });

  it('un producto apunta a su propia ficha', async () => {
    getProduct.mockResolvedValue({
      name: 'Torta de chocolate',
      description: 'Ocho porciones',
      imageUrls: [],
    });
    const { generateMetadata } = await import('./[tenantDomain]/tienda/[slug]/page');

    const metadata = await generateMetadata({
      params: Promise.resolve({ tenantDomain: 'acme.cl', slug: 'torta-chocolate' }),
    });

    expect(canonicalOf(metadata)).toBe('/tienda/torta-chocolate');
  });

  it('el índice del blog distingue sus páginas', async () => {
    const { generateMetadata } = await import('./[tenantDomain]/blog/page');

    const first = await generateMetadata({
      params: Promise.resolve({ tenantDomain: 'acme.cl' }),
      searchParams: Promise.resolve({}),
    });
    const second = await generateMetadata({
      params: Promise.resolve({ tenantDomain: 'acme.cl' }),
      searchParams: Promise.resolve({ page: '2' }),
    });

    expect(canonicalOf(first)).toBe('/blog');
    expect(canonicalOf(second)).toBe('/blog?page=2');
    expect(second.title).toBe('Blog — página 2');
  });

  it('una búsqueda en la tienda no se indexa ni se declara canónica', async () => {
    const { generateMetadata } = await import('./[tenantDomain]/tienda/page');

    const metadata = await generateMetadata({
      params: Promise.resolve({ tenantDomain: 'acme.cl' }),
      searchParams: Promise.resolve({ q: 'torta' }),
    });

    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(canonicalOf(metadata)).toBeUndefined();
  });

  it('el filtro por categoría sí es una URL canónica propia', async () => {
    const { generateMetadata } = await import('./[tenantDomain]/tienda/page');

    const metadata = await generateMetadata({
      params: Promise.resolve({ tenantDomain: 'acme.cl' }),
      searchParams: Promise.resolve({ categoria: 'tortas' }),
    });

    expect(canonicalOf(metadata)).toBe('/tienda?categoria=tortas');
  });

  it('el layout de tenant fija la base pero NO un canónico heredable', async () => {
    getSettings.mockResolvedValue({
      ...SETTINGS,
      brand: { assets: {} },
    });
    const { generateMetadata } = await import('./[tenantDomain]/layout');

    const metadata = await generateMetadata({
      params: Promise.resolve({ tenantDomain: 'acme.cl' }),
    });

    expect(metadata.metadataBase?.toString()).toBe('https://acme.cl/');
    expect(metadata.alternates).toBeUndefined();
  });
});
