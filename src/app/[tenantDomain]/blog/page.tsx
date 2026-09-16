import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { createBlogService } from '@/modules/Blog/infrastructure/blogServiceFactory';
import { createGlobalSettingsService } from '@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory';
import { BlogPostCard } from '@/modules/Blog/presentation/BlogPostCard';
import { Button } from '@/shared/ui/button';

const PER_PAGE = 9;

interface BlogIndexPageProps {
  readonly params: Promise<{ tenantDomain: string }>;
  readonly searchParams: Promise<{ page?: string; tag?: string }>;
}

const parsePage = (value: string | undefined): number => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

export async function generateMetadata({
  params,
}: Pick<BlogIndexPageProps, 'params'>): Promise<Metadata> {
  const { tenantDomain } = await params;
  const settings = await createGlobalSettingsService(tenantDomain).getSettings();

  return {
    title: 'Blog',
    description:
      settings.tagline !== '' ? settings.tagline : `Novedades de ${settings.siteName}`,
  };
}

export default async function BlogIndexPage({
  params,
  searchParams,
}: BlogIndexPageProps): Promise<ReactElement> {
  const { tenantDomain } = await params;
  const { page: pageParam, tag } = await searchParams;
  const page = parsePage(pageParam);

  const { posts, total, perPage } = await createBlogService(tenantDomain).listPosts({
    page,
    perPage: PER_PAGE,
    tag,
  });
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  const pageHref = (targetPage: number): string => {
    const query = new URLSearchParams();
    if (targetPage > 1) {
      query.set('page', String(targetPage));
    }
    if (tag !== undefined) {
      query.set('tag', tag);
    }
    const search = query.toString();
    return search === '' ? '/blog' : `/blog?${search}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 flex flex-col gap-2">
        <h1 className="ui-heading text-4xl md:text-5xl">Blog</h1>
        {tag !== undefined && (
          <p className="text-muted-foreground text-sm">
            Filtrando por <span className="font-semibold">#{tag}</span> ·{' '}
            <Link href="/blog" className="underline">
              Ver todas
            </Link>
          </p>
        )}
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">
          {tag !== undefined
            ? `Todavía no hay publicaciones con la etiqueta "${tag}".`
            : 'Todavía no hay publicaciones. Vuelve pronto.'}
        </p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} variant="grid" />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Paginación del blog"
              className="mt-12 flex items-center justify-center gap-3"
            >
              {page <= 1 ? (
                <Button variant="outline" size="sm" disabled>
                  Anterior
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href={pageHref(page - 1)}>Anterior</Link>
                </Button>
              )}
              <span className="text-muted-foreground text-sm">
                Página {page} de {totalPages}
              </span>
              {page >= totalPages ? (
                <Button variant="outline" size="sm" disabled>
                  Siguiente
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href={pageHref(page + 1)}>Siguiente</Link>
                </Button>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
