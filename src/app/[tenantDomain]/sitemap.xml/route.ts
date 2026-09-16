import { NextResponse, type NextRequest } from 'next/server';
import { createPageService } from '@/modules/Page/infrastructure/pageServiceFactory';

const HOME_SLUG = 'home';

// Ruta propia en vez del `sitemap.ts` de Next porque el sitemap es POR TENANT y el tenant
// llega en el segmento de la ruta, no en la configuración del proyecto.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantDomain: string }> },
): Promise<NextResponse> {
  const { tenantDomain } = await params;
  const origin = new URL(request.url).origin;
  const pages = await createPageService(tenantDomain).getPublishedPages();

  const entries = pages.map((page) => {
    const path = page.slug === HOME_SLUG ? '/' : `/${page.slug}`;
    const lastmod =
      page.updatedAt === null ? '' : `\n    <lastmod>${page.updatedAt}</lastmod>`;
    return `  <url>\n    <loc>${origin}${path}</loc>${lastmod}\n  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
