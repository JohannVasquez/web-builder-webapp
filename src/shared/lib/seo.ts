import type { Metadata } from 'next';

// El canónico viaja como ruta relativa: `metadataBase` del layout de tenant ya apunta al
// dominio principal del cliente, así que repetir el dominio en cada página solo daría
// ocasión de equivocarse en los tenants que tienen más de uno.
//
// Cada página DEBE declarar el suyo. El metadata de Next se hereda de padre a hijo, así que
// un canónico puesto en el layout se propaga a todas las rutas: cada URL terminaría diciendo
// que la versión buena de sí misma es otra, y el buscador las descarta.
export const canonical = (path: string): Metadata['alternates'] => ({ canonical: path });

// Un listado paginado necesita canónico propio por página: sin el parámetro, `?page=2` y
// `?page=3` se declaran copias de la primera y compiten entre ellas.
export const canonicalPaged = (
  path: string,
  page: number,
  extra: Readonly<Record<string, string | undefined>> = {},
): Metadata['alternates'] => {
  const query = new URLSearchParams();
  if (page > 1) {
    query.set('page', String(page));
  }
  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined && value !== '') {
      query.set(key, value);
    }
  }
  const search = query.toString();
  return canonical(search === '' ? path : `${path}?${search}`);
};

// El número de página viaja en el título para que dos páginas de un mismo listado no
// compartan el mismo rótulo en los resultados.
export const pagedTitle = (title: string, page: number): string =>
  page > 1 ? `${title} — página ${page}` : title;

// Las rutas transaccionales (carrito, pago, agradecimiento) no aportan nada en un buscador y
// suelen llevar datos del pedido en la URL.
export const NO_INDEX: Metadata['robots'] = { index: false, follow: false };

// Un entero mayor que cero, o la primera página. Vale para cualquier listado.
export const parsePageParam = (value: string | undefined): number => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};
