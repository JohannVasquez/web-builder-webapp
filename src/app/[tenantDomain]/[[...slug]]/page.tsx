import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import { createPageService } from '@/modules/Page/infrastructure/pageServiceFactory';
import { createBlogService } from '@/modules/Blog/infrastructure/blogServiceFactory';
import { createStoreService } from '@/modules/Store/infrastructure/storeServiceFactory';
import { SectionRenderer } from '@/modules/Page/presentation/SectionRenderer';
import { canonical, NO_INDEX, robotsFor } from '@/shared/lib/seo';

interface DynamicPageProps {
  readonly params: Promise<{ tenantDomain: string; slug?: string[] }>;
}

const HOME_SLUG = 'home';

const resolveSlug = (segments: string[] | undefined): string => {
  if (segments === undefined || segments.length === 0) {
    return HOME_SLUG;
  }
  return segments.join('/');
};

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  const { tenantDomain, slug } = await params;
  const resolved = resolveSlug(slug);
  const page = await createPageService(tenantDomain).getPage(resolved);
  if (page === null) {
    return { title: 'Página no encontrada', robots: NO_INDEX };
  }
  return {
    title: page.seoTitle ?? page.title,
    description: page.seoDescription ?? page.description,
    robots: robotsFor(page.noindex),
    alternates: canonical(resolved === HOME_SLUG ? '/' : `/${resolved}`),
    ...(page.ogImageUrl === null || page.ogImageUrl === undefined
      ? {}
      : { openGraph: { images: [{ url: page.ogImageUrl }] } }),
  };
}

export default async function DynamicPage({
  params,
}: DynamicPageProps): Promise<ReactElement> {
  const { tenantDomain, slug } = await params;
  const page = await createPageService(tenantDomain).getPage(resolveSlug(slug));

  if (page === null) {
    notFound();
  }

  const sections = (
    <SectionRenderer
      sections={page.sections}
      blogService={createBlogService(tenantDomain)}
      storeService={createStoreService(tenantDomain)}
    />
  );

  // Una página con estilo propio lo aplica a su contenido; el menú y el pie siguen con el del
  // sitio, que es lo que une a todas las páginas. `ui-page-backdrop` pinta el fondo decorativo
  // del estilo de la página (manchas, patrones) en vez del del sitio.
  if (page.visualStyle === null) {
    return sections;
  }
  return (
    <div data-visual-style={page.visualStyle} className="ui-page-backdrop isolate">
      {sections}
    </div>
  );
}
