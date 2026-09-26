// Demo de prospecto (épica DEMO): el sitio privado de un negocio real que todavía no compró.
// No confundir con los "sitios de demostración" de web-builder-api#104, que son públicos.
//
// La API cierra entero un tenant en estado `demo`: sin un token válido en `X-Demo-Token`
// responde 404 en todas sus rutas públicas. El prospecto recibe ese token en un enlace
// mágico (`/demo/<token>`), el sitio lo canjea por una cookie httpOnly y desde ahí lo reenvía
// en cada llamada a la API hecha desde el servidor. Ver "Demos de prospecto" en el README.

export const DEMO_TOKEN_COOKIE = 'demo_token';

export const DEMO_TOKEN_HEADER = 'X-Demo-Token';

// La API lo agrega a toda respuesta servida con un token de demo válido.
export const DEMO_RESPONSE_HEADER = 'X-Demo';

// Base de las acciones del navegador mientras se mira una demo. Los servicios de cliente
// arman `${base}/api/<acción>`, así que con esta base la llamada cae en
// `src/app/[tenantDomain]/demo/api/[...path]` (servidor de Next), que agrega el token desde
// la cookie. `/api/*` a secas no sirve: en producción Caddy lo manda directo a la API y el
// navegador no puede leer la cookie httpOnly para poner el header.
export const DEMO_ACTIONS_BASE_URL = '/demo';

// Las respuestas de una demo no pueden quedar en ninguna caché ni en ningún buscador.
export const DEMO_RESPONSE_HEADERS: Readonly<Record<string, string>> = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
};

// 30 días: más que la vigencia inicial de una demo (14). Que la cookie siga viva después de
// vencida la demo no abre nada: la API valida el token en cada petición.
const DEMO_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const DEMO_TOKEN_PATTERN = /^demo_[0-9a-f]{64}$/;

export const isDemoToken = (value: string | null | undefined): value is string =>
  typeof value === 'string' && DEMO_TOKEN_PATTERN.test(value);

// Sin `domain` a propósito: la cookie queda atada al host exacto de la demo, así que ni otra
// demo ni el dominio de la plataforma la reciben.
export const demoCookieOptions = (): {
  readonly httpOnly: true;
  readonly secure: boolean;
  readonly sameSite: 'lax';
  readonly path: '/';
  readonly maxAge: number;
} => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: DEMO_COOKIE_MAX_AGE_SECONDS,
});

// Una demo solo vive en `demo-<slug>.<PLATFORM_DOMAIN>`. Con `PLATFORM_DOMAIN` definido se
// exige el sufijo exacto, para no confundir con una demo el dominio propio de un cliente que
// empiece por `demo-` (ej. `demo-motors.cl`). Sin él, basta el prefijo del primer tramo.
export const isDemoHost = (
  host: string,
  platformDomain: string | undefined = process.env.PLATFORM_DOMAIN,
): boolean => {
  const hostname = host.split(':')[0]?.toLowerCase() ?? '';
  const [label, ...rest] = hostname.split('.');
  if (
    label === undefined ||
    !label.startsWith('demo-') ||
    label.length <= 'demo-'.length
  ) {
    return false;
  }
  const platform = platformDomain?.trim().toLowerCase() ?? '';
  return platform === '' ? rest.length > 0 : rest.join('.') === platform;
};

// Solo para mostrar: el panel arma con esto la vista previa `demo-<slug>.<dominio>` antes de
// crear la demo. La dirección real la devuelve la API. Vacío = vista previa genérica.
export const getPlatformDomain = (): string => process.env.PLATFORM_DOMAIN?.trim() ?? '';
