import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ReactElement } from 'react';

export interface Crumb {
  readonly label: string;
  // La última miga es la página actual: no se enlaza a sí misma.
  readonly href?: string;
}

interface BreadcrumbsProps {
  readonly crumbs: readonly Crumb[];
  readonly siteUrl: string;
}

// El dato estructurado repite exactamente las migas visibles: declarar una ruta que el
// visitante no ve es justo lo que los buscadores penalizan.
const breadcrumbJsonLd = (
  crumbs: readonly Crumb[],
  siteUrl: string,
): Record<string, unknown> => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: crumbs.map((crumb, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: crumb.label,
    ...(crumb.href === undefined ? {} : { item: `${siteUrl}${crumb.href}` }),
  })),
});

// Una sola miga sería "Inicio" a secas: no orienta a nadie y no aporta nada al buscador.
export function Breadcrumbs({ crumbs, siteUrl }: BreadcrumbsProps): ReactElement | null {
  if (crumbs.length < 2) {
    return null;
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs, siteUrl)),
        }}
      />
      <nav aria-label="Ruta de navegación">
        <ol className="text-muted-foreground flex flex-wrap items-center gap-1 text-sm">
          {crumbs.map((crumb, index) => {
            const isLast = index === crumbs.length - 1;
            return (
              <li key={crumb.label} className="flex items-center gap-1">
                {index > 0 && (
                  <ChevronRight aria-hidden="true" className="size-3.5 shrink-0" />
                )}
                {isLast || crumb.href === undefined ? (
                  <span aria-current="page" className="text-foreground font-medium">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className="hover:text-foreground underline-offset-2 hover:underline"
                  >
                    {crumb.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
