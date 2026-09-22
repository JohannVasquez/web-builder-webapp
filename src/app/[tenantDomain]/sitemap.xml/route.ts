import { NextResponse, type NextRequest } from 'next/server';
import { createPageService } from '@/modules/Page/infrastructure/pageServiceFactory';
import { createBlogService } from '@/modules/Blog/infrastructure/blogServiceFactory';
import { createGlobalSettingsService } from '@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory';
import { isUnderConstruction } from '@/modules/GlobalSettings/domain/GlobalSettings';
import type { BlogPostSummary } from '@/modules/Blog/domain/BlogPost';

const HOME_SLUG = 'home';
// 50 es el máximo que acepta `GET /api/blog` (ver `perPage`); pedir más devuelve un 400 que
// `BlogService` convertiría en "sin publicaciones", vaciando el sitemap por completo.
const BLOG_PAGE_SIZE = 50;
// Tope de páginas al paginar el blog completo: cubre hasta 1000 publicaciones, más que
// suficiente en la práctica, sin arriesgar un bucle sin fin si `total` viniera mal.
const MAX_BLOG_PAGES = 20;

// Todas las publicaciones visibles, paginando la API del blog hasta agotar `total`.
const getAllBlogPosts = async (tenantDomain: string): Promise<BlogPostSummary[]> => {
  const blogService = createBlogService(tenantDomain);
  const posts: BlogPostSummary[] = [];
  for (let page = 1; page <= MAX_BLOG_PAGES; page += 1) {
    const result = await blogService.listPosts({ page, perPage: BLOG_PAGE_SIZE });
    posts.push(...result.posts);
    if (posts.length >= result.total || result.posts.length === 0) {
      break;
    }
  }
  return posts;
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

  const [pages, blogPosts] = await Promise.all([
    createPageService(tenantDomain).getPublishedPages(),
    getAllBlogPosts(tenantDomain),
  ]);

  // Lo que la propia página pide no indexar tampoco se le ofrece al rastreador: un sitemap
  // que lista una URL `noindex` son dos señales contradictorias.
  const entries = pages
    .filter((page) => page.noindex !== true)
    .map((page) => {
      const path = page.slug === HOME_SLUG ? '/' : `/${page.slug}`;
      const lastmod =
        page.updatedAt === null ? '' : `\n    <lastmod>${page.updatedAt}</lastmod>`;
      return `  <url>\n    <loc>${origin}${path}</loc>${lastmod}\n  </url>`;
    });

  // Además de cada publicación, el índice del blog: sin publicaciones no tiene sentido
  // listarlo, ya que estaría vacío y no aportaría nada a un rastreador.
  const blogEntries =
    blogPosts.length === 0
      ? []
      : [
          `  <url>\n    <loc>${origin}/blog</loc>\n  </url>`,
          ...blogPosts
            .filter((post) => post.noindex !== true)
            .map(
              (post) =>
                `  <url>\n    <loc>${origin}/blog/${post.slug}</loc>\n    <lastmod>${post.publishedAt}</lastmod>\n  </url>`,
            ),
        ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...entries, ...blogEntries].join('\n')}
</urlset>`;

  return xmlResponse(xml);
}
