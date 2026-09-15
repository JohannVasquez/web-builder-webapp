import { NextResponse, type NextRequest } from 'next/server';

/**
 * Resuelve el tenant una sola vez, en el borde, y lo mete en la ruta:
 * una visita a `https://acme.cl/nosotros` se reescribe internamente a
 * `/acme.cl/nosotros`. La barra de direcciones no cambia — `rewrite` es
 * interno, no un redirect — así que los `href="/nosotros"` de la app siguen
 * siendo correctos y no hay que prefijar ningún enlace.
 *
 * El motivo de fondo es que leer el `Host` con `headers()` dentro de un
 * server component marca la ruta como dinámica y le prohíbe a Next
 * prerenderizarla o cachearla. Con el tenant en la ruta, cada tenant es un
 * path distinto: nada impide cachear por tenant el día que se defina la
 * estrategia de revalidación.
 *
 * Efecto secundario útil en local: puedes probar cualquier tenant por path
 * (`localhost:3000/acme.localhost/nosotros`) sin tocar DNS ni /etc/hosts.
 *
 * Como el reescrito se aplica a *todas* las peticiones, la forma interna no
 * es direccionable desde fuera: pedir `/acme.localhost/nosotros` a mano se
 * convierte en `/<host>/acme.localhost/nosotros`, que no existe y da 404.
 */
export function proxy(request: NextRequest): NextResponse {
  const host = request.headers.get('host') ?? request.nextUrl.hostname;
  const tenantDomain = host.split(':')[0]?.toLowerCase() ?? '';

  const url = request.nextUrl.clone();
  // Evita el `//` (y el redirect de trailing slash) cuando se pide la raíz.
  url.pathname = `/${tenantDomain}${url.pathname === '/' ? '' : url.pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  // Sin matcher, el proxy correría también sobre los assets de _next, que no
  // deben reescribirse.
  //
  // Ojo con el patrón habitual `(?!.*\\..*)` de excluir "rutas con punto":
  // aquí los tenants SON dominios y llevan puntos, así que ese patrón dejaba
  // pasar `/acme.localhost/...` sin reescribir y volvía direccionable desde
  // fuera la forma interna de la ruta. Este proyecto no tiene `public/`, así
  // que basta con excluir `_next/` y el favicon.
  // `api/revalidate` queda fuera: es endpoint del propio frontend (SPEC 0.2), no de tenant.
  matcher: ['/((?!_next/|api/revalidate|favicon\\.ico).*)'],
};
