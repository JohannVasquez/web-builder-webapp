import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { notFoundWithRedirect } from '@/modules/Redirect/presentation/notFoundWithRedirect';
import { createRedirectService } from '@/modules/Redirect/infrastructure/redirectServiceFactory';
import { createStoreService } from '@/modules/Store/infrastructure/storeServiceFactory';
import { createGlobalSettingsService } from '@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory';
import { ProductCard } from '@/modules/Store/presentation/ProductCard';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { cn } from '@/shared/lib/utils';
import { canonicalPaged, NO_INDEX, pagedTitle, parsePageParam } from '@/shared/lib/seo';

const PER_PAGE = 12;

interface StoreIndexPageProps {
  readonly params: Promise<{ tenantDomain: string }>;
  readonly searchParams: Promise<{ q?: string; categoria?: string; page?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: StoreIndexPageProps): Promise<Metadata> {
  const { tenantDomain } = await params;
  const { page: pageParam, categoria, q } = await searchParams;
  const page = parsePageParam(pageParam);
  const settings = await createGlobalSettingsService(tenantDomain).getSettings();

  // Una búsqueda es un listado distinto por cada término que alguien escriba: infinitas URLs
  // de contenido pobre. Se muestran, pero no se indexan ni se declaran canónicas.
  const searching = q !== undefined && q !== '';

  return {
    title: pagedTitle('Tienda', page),
    description: `Productos de ${settings.siteName}`,
    robots: searching ? NO_INDEX : undefined,
    alternates: searching ? undefined : canonicalPaged('/tienda', page, { categoria }),
  };
}

export default async function StoreIndexPage({
  params,
  searchParams,
}: StoreIndexPageProps): Promise<ReactElement> {
  const { tenantDomain } = await params;
  const storeService = createStoreService(tenantDomain);

  const store = await storeService.getStoreSettings();
  if (store === null) {
    return await notFoundWithRedirect(createRedirectService(tenantDomain), '/tienda');
  }

  const { q, categoria, page: pageParam } = await searchParams;
  const page = parsePageParam(pageParam);

  const [{ products, total, perPage }, categories] = await Promise.all([
    storeService.listProducts({
      page,
      perPage: PER_PAGE,
      search: q,
      category: categoria,
    }),
    storeService.listCategories(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  // Una página fuera de rango es un listado vacío con URL propia: si responde 200, el
  // buscador la indexa como contenido sin valor. Mejor que no exista.
  if (page > totalPages) {
    return await notFoundWithRedirect(createRedirectService(tenantDomain), '/tienda');
  }

  const pageHref = (targetPage: number): string => {
    const query = new URLSearchParams();
    if (q !== undefined && q !== '') {
      query.set('q', q);
    }
    if (categoria !== undefined) {
      query.set('categoria', categoria);
    }
    if (targetPage > 1) {
      query.set('page', String(targetPage));
    }
    const search = query.toString();
    return search === '' ? '/tienda' : `/tienda?${search}`;
  };

  const categoryHref = (slug: string | undefined): string => {
    const query = new URLSearchParams();
    if (q !== undefined && q !== '') {
      query.set('q', q);
    }
    if (slug !== undefined) {
      query.set('categoria', slug);
    }
    const search = query.toString();
    return search === '' ? '/tienda' : `/tienda?${search}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-10 flex flex-col gap-2">
        <h1 className="ui-heading text-4xl md:text-5xl">Tienda</h1>
      </div>

      <div className="mb-8 flex flex-col gap-6">
        <form method="get" action="/tienda" className="flex max-w-md gap-2">
          {categoria !== undefined && (
            <input type="hidden" name="categoria" value={categoria} />
          )}
          <Input
            type="search"
            name="q"
            placeholder="Buscar productos..."
            defaultValue={q ?? ''}
          />
          <Button type="submit">Buscar</Button>
        </form>

        {categories.length > 0 && (
          <nav aria-label="Categorías" className="flex flex-wrap gap-2">
            <Link
              href={categoryHref(undefined)}
              className={cn(
                'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                categoria === undefined
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
              )}
            >
              Todas
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={categoryHref(category.slug)}
                className={cn(
                  'rounded-full px-3 py-1 text-sm font-medium transition-colors',
                  categoria === category.slug
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
                )}
              >
                {category.name}
              </Link>
            ))}
          </nav>
        )}
      </div>

      {products.length === 0 ? (
        <p className="text-muted-foreground">
          {q !== undefined && q !== ''
            ? `No encontramos productos para "${q}".`
            : 'Todavía no hay productos. Vuelve pronto.'}
        </p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>

          {totalPages > 1 && (
            <nav
              aria-label="Paginación de la tienda"
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
