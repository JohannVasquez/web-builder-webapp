import { NextResponse, type NextRequest } from 'next/server';
import { createBlogService } from '@/modules/Blog/infrastructure/blogServiceFactory';
import { createGlobalSettingsService } from '@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory';
import { buildBlogRssXml } from '@/modules/Blog/presentation/rssFeed';
import { DEMO_RESPONSE_HEADERS } from '@/shared/config/demo';
import { isDemoRequest } from '@/shared/lib/demoAccess';

// Suficiente para un feed razonable sin paginar el canal RSS (SPEC 7.4).
const RSS_ITEM_LIMIT = 50;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantDomain: string }> },
): Promise<NextResponse> {
  const { tenantDomain } = await params;

  // Una demo de prospecto no tiene canal RSS: nada suyo sale del sitio hacia un lector.
  if (await isDemoRequest(tenantDomain)) {
    return new NextResponse(null, { status: 404, headers: DEMO_RESPONSE_HEADERS });
  }

  const origin = new URL(request.url).origin;

  const [settings, { posts }] = await Promise.all([
    createGlobalSettingsService(tenantDomain).getSettings(),
    createBlogService(tenantDomain).listPosts({ page: 1, perPage: RSS_ITEM_LIMIT }),
  ]);

  const xml = buildBlogRssXml(
    {
      siteName: settings.siteName,
      siteUrl: origin,
      description:
        settings.tagline !== '' ? settings.tagline : `Novedades de ${settings.siteName}`,
    },
    posts,
  );

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
