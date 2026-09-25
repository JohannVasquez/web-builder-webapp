import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { createPageService } from '@/modules/Page/infrastructure/pageServiceFactory';
import { createBlogService } from '@/modules/Blog/infrastructure/blogServiceFactory';
import { createStoreService } from '@/modules/Store/infrastructure/storeServiceFactory';
import { createGlobalSettingsService } from '@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory';
import { SectionRenderer } from '@/modules/Page/presentation/SectionRenderer';
import { notFoundWithRedirect } from '@/modules/Redirect/presentation/notFoundWithRedirect';
import { createRedirectService } from '@/modules/Redirect/infrastructure/redirectServiceFactory';
import { canonical, NO_INDEX, robotsFor } from '@/shared/lib/seo';
import { Breadcrumbs, type Crumb } from '@/shared/ui/Breadcrumbs';

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

// Un tramo intermedio solo se enlaza si existe como página publicada: llevar al visitante a un
// 404 es peor que no ofrecerle el atajo.
const buildCrumbs = async (
  pageService: ReturnType<typeof createPageService>,
  slug: string,
  title: string,
): Promise<Crumb[]> => {
  const segments = slug === HOME_SLUG ? [] : slug.split('/');
  if (segments.length < 2) {
    return [];
  }

  const published = await pageService.getPublishedPages();
  const ancestors = segments.slice(0, -1).flatMap((_, index) => {
    const path = segments.slice(0, index + 1).join('/');
    const match = published.find((candidate) => candidate.slug === path);
    return match === undefined ? [] : [{ label: match.title, href: `/${path}` }];
  });

  return [{ label: 'Inicio', href: '/' }, ...ancestors, { label: title }];
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
  const pageService = createPageService(tenantDomain);
  const resolved = resolveSlug(slug);
  const page = await pageService.getPage(resolved);

  if (page === null) {
    return await notFoundWithRedirect(
      createRedirectService(tenantDomain),
      resolved === 'home' ? '/' : `/${resolved}`,
    );
  }

  // Las migas solo tienen sentido con slug anidado: en `/nosotros` serían "Inicio > Nosotros",
  // que no orienta a nadie. Los ancestros se piden a la lista de publicadas porque un tramo
  // intermedio (`/servicios` de `/servicios/tortas`) puede no existir como página.
  const [crumbs, settings] = await Promise.all([
    buildCrumbs(pageService, resolved, page.title),
    createGlobalSettingsService(tenantDomain).getSettings(),
  ]);
  const siteUrl = `https://${settings.primaryDomain ?? tenantDomain}`;

  const sections = (
    <>
      {crumbs.length > 1 && (
        <div className="mx-auto max-w-6xl px-6 pt-8">
          <Breadcrumbs siteUrl={siteUrl} crumbs={crumbs} />
        </div>
      )}
      <SectionRenderer
        sections={page.sections}
        blogService={createBlogService(tenantDomain)}
        storeService={createStoreService(tenantDomain)}
      />
    </>
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
