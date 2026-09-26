import { NextResponse, type NextRequest } from 'next/server';
import {
  DEMO_RESPONSE_HEADERS,
  DEMO_TOKEN_COOKIE,
  isDemoHost,
  isDemoToken,
} from '@/shared/config/demo';
import { redeemDemoLink } from '@/modules/Demo/infrastructure/redeemDemoLink';

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
// Host reservado del panel de la agencia. No es un tenant: no se resuelve contra la base y
// por eso se decide aquí, antes de meter el dominio en la ruta.
const ADMIN_HOST_LABEL = 'admin';

// Enlace mágico de una demo de prospecto: un solo tramo después de `/demo/`. Las acciones del
// navegador (`/demo/api/...`) tienen más tramos y siguen de largo hasta su route handler.
const DEMO_LINK_PATH = /^\/demo\/([^/]+)\/?$/;

// Lo pone el router de Next en las precargas de un <Link>, no en la navegación real.
const PREFETCH_HEADER = 'next-router-prefetch';

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const host = request.headers.get('host') ?? request.nextUrl.hostname;
  const tenantDomain = host.split(':')[0]?.toLowerCase() ?? '';

  const url = request.nextUrl.clone();

  if (tenantDomain.split('.')[0] === ADMIN_HOST_LABEL) {
    url.pathname = `/admin${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  const demoLink = DEMO_LINK_PATH.exec(url.pathname);
  if (demoLink?.[1] !== undefined && request.method === 'GET') {
    return redeemDemoLink(request, tenantDomain, demoLink[1]);
  }

  // Evita el `//` (y el redirect de trailing slash) cuando se pide la raíz.
  url.pathname = `/${tenantDomain}${url.pathname === '/' ? '' : url.pathname}`;

  // Una demo no se guarda en ninguna caché ni entra a ningún buscador, tenga o no acceso quien
  // la pide: por el host basta, aunque no haya cookie (ni Google ni un curioso la tienen).
  const isDemo =
    isDemoHost(tenantDomain) ||
    isDemoToken(request.cookies.get(DEMO_TOKEN_COOKIE)?.value);

  if (!isDemo) {
    return NextResponse.rewrite(url);
  }

  // En una demo no se precarga nada. La precarga de un <Link> que entra a la vista renderiza
  // esa ruta en el servidor (al menos su metadata), que pide la página a la API con el token
  // del prospecto, y la API la anota como visita: abrir la portada dejaba "visitadas" todas
  // las páginas del menú. Sin precarga, la página se pide al hacer clic, que es cuando el
  // prospecto de verdad la abre. Next solo deja ver esta cabecera aquí con
  // `skipProxyUrlNormalize` (ver next.config.ts); a `headers()` nunca le llega.
  if (request.headers.get(PREFETCH_HEADER) === '1') {
    return new NextResponse(null, { status: 204, headers: DEMO_RESPONSE_HEADERS });
  }

  return NextResponse.rewrite(url, { headers: DEMO_RESPONSE_HEADERS });
}

export const config = {
  // Sin matcher, el proxy correría también sobre los assets de _next, que no
  // deben reescribirse.
  //
  // Ojo con el patrón habitual `(?!.*\\..*)` de excluir "rutas con punto":
  // aquí los tenants SON dominios y llevan puntos, así que ese patrón dejaba
  // pasar `/acme.localhost/...` sin reescribir y volvía direccionable desde
  // fuera la forma interna de la ruta. Lo único que hay en `public/` son las
  // imágenes de ejemplo de la guía de estilos, que ya quedan bajo `styleguide`.
  // `api/revalidate` queda fuera: es endpoint del propio frontend (SPEC 0.2), no de tenant.
  matcher: ['/((?!_next/|api/revalidate|api/catalog|styleguide|favicon\\.ico).*)'],
};
