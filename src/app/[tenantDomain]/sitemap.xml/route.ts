import { NextResponse, type NextRequest } from 'next/server';
import { createPageService } from '@/modules/Page/infrastructure/pageServiceFactory';
import { createBlogService } from '@/modules/Blog/infrastructure/blogServiceFactory';
import { createStoreService } from '@/modules/Store/infrastructure/storeServiceFactory';
import type { BlogPostSummary } from '@/modules/Blog/domain/BlogPost';
import { createGlobalSettingsService } from '@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory';
import { isUnderConstruction } from '@/modules/GlobalSettings/domain/GlobalSettings';
import type { ProductView } from '@/modules/Store/domain/Product';

const HOME_SLUG = 'home';
// 50 es el máximo que acepta `GET /api/blog` (ver `perPage`); pedir más devuelve un 400 que
// `BlogService` convertiría en "sin publicaciones", vaciando el sitemap por completo.
const BLOG_PAGE_SIZE = 50;
const PRODUCT_PAGE_SIZE = 50;
// Tope de páginas al paginar: cubre hasta 1000 elementos, más que suficiente en la práctica,
// sin arriesgar un bucle sin fin si `total` viniera mal.
const MAX_PAGES = 20;

interface SitemapEntry {
  readonly path: string;
  readonly lastmod?: string | null;
}

// Todas las publicaciones visibles, paginando la API del blog hasta agotar `total`.
const getAllBlogPosts = async (tenantDomain: string): Promise<BlogPostSummary[]> => {
  const blogService = createBlogService(tenantDomain);
  const posts: BlogPostSummary[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await blogService.listPosts({ page, perPage: BLOG_PAGE_SIZE });
    posts.push(...result.posts);
    if (posts.length >= result.total || result.posts.length === 0) {
      break;
    }
  }
  return posts;
};

// Mismo recorrido para el catálogo. La tienda apagada responde una lista vacía, así que no
// hace falta comprobarla aquí: quien decide si se listan los productos es `getStoreSettings`.
const getAllProducts = async (tenantDomain: string): Promise<ProductView[]> => {
  const storeService = createStoreService(tenantDomain);
  const products: ProductView[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await storeService.listProducts({ page, perPage: PRODUCT_PAGE_SIZE });
    products.push(...result.products);
    if (products.length >= result.total || result.products.length === 0) {
      break;
    }
  }
  return products;
};

// Las URLs de la tienda solo existen si la tienda está encendida: listarlas con la tienda
// apagada llevaría al rastreador a un 404 en cada producto.
const getStoreEntries = async (tenantDomain: string): Promise<SitemapEntry[]> => {
  const storeService = createStoreService(tenantDomain);
  const store = await storeService.getStoreSettings();
  if (store === null) {
    return [];
  }

  const [products, categories] = await Promise.all([
    getAllProducts(tenantDomain),
    storeService.listCategories(),
  ]);

  return [
    { path: '/tienda' },
    // El filtro por categoría es la URL canónica de ese listado (ver `/tienda`), así que
    // vale la pena ofrecerlo al rastreador en vez de dejarlo detrás de un formulario.
    ...categories.map((category) => ({
      path: `/tienda?categoria=${encodeURIComponent(category.slug)}`,
    })),
    ...products.map((product) => ({
      path: `/tienda/${product.slug}`,
      lastmod: product.updatedAt,
    })),
  ];
};

const toXmlEntry = (origin: string, entry: SitemapEntry): string => {
  const lastmod =
    entry.lastmod === undefined || entry.lastmod === null
      ? ''
      : `\n    <lastmod>${entry.lastmod}</lastmod>`;
  // `&` dentro de una URL rompe el XML; el resto de los caracteres ya vienen escapados por
  // `encodeURIComponent` en quien construye la ruta.
  const loc = `${origin}${entry.path}`.replaceAll('&', '&amp;');
  return `  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`;
};

const xmlResponse = (xml: string): NextResponse =>
  new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });

const emptySitemap = (): NextResponse =>
  xmlResponse(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>`,
  );

// Ruta propia en vez del `sitemap.ts` de Next porque el sitemap es POR TENANT y el tenant
// llega en el segmento de la ruta, no en la configuración del proyecto.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantDomain: string }> },
): Promise<NextResponse> {
  const { tenantDomain } = await params;
  const origin = new URL(request.url).origin;

  // Un sitio en construcción no ofrece nada que rastrear, pero el sitemap sigue existiendo
  // para que el cliente pueda comprobar que está vacío a propósito.
  const settings = await createGlobalSettingsService(tenantDomain).getSettings();
  if (isUnderConstruction(settings)) {
    return emptySitemap();
  }

  const [pages, blogPosts, storeEntries] = await Promise.all([
    createPageService(tenantDomain).getPublishedPages(),
    getAllBlogPosts(tenantDomain),
    getStoreEntries(tenantDomain),
  ]);

  // Lo que la propia página pide no indexar tampoco se le ofrece al rastreador: un sitemap
  // que lista una URL `noindex` son dos señales contradictorias.
  const pageEntries: SitemapEntry[] = pages
    .filter((page) => page.noindex !== true)
    .map((page) => ({
      path: page.slug === HOME_SLUG ? '/' : `/${page.slug}`,
      lastmod: page.updatedAt,
    }));

  // Además de cada publicación, el índice del blog: sin publicaciones no tiene sentido
  // listarlo, ya que estaría vacío y no aportaría nada a un rastreador.
  const blogEntries: SitemapEntry[] =
    blogPosts.length === 0
      ? []
      : [
          { path: '/blog' },
          ...blogPosts
            .filter((post) => post.noindex !== true)
            .map((post) => ({
              path: `/blog/${post.slug}`,
              lastmod: post.publishedAt,
            })),
        ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...pageEntries, ...blogEntries, ...storeEntries]
  .map((entry) => toXmlEntry(origin, entry))
  .join('\n')}
</urlset>`;

  return xmlResponse(xml);
}
