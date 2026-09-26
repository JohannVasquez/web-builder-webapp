import { getApiBaseUrl } from '@/shared/config/api';
import {
  DEMO_RESPONSE_HEADERS,
  DEMO_TOKEN_HEADER,
  isDemoToken,
} from '@/shared/config/demo';
import { TENANT_DOMAIN_HEADER } from '@/shared/config/tenant';
import { toForwardedDemoAction } from '../domain/DemoAction';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

interface ForwardDemoActionInput {
  readonly tenantDomain: string;
  readonly segments: readonly string[];
  readonly request: Request;
  readonly demoToken: string | undefined;
  readonly fetchFn?: FetchLike;
}

// Mismo 404 mudo que da la API: fuera de una demo canjeada esta ruta no existe.
const notFound = (): Response =>
  new Response(null, { status: 404, headers: DEMO_RESPONSE_HEADERS });

// Cabeceras de la petición original que la API necesita para responder igual que siempre.
const FORWARDED_REQUEST_HEADERS = ['content-type', 'idempotency-key'] as const;

const NULL_BODY_STATUSES = new Set([204, 205, 304]);

// Reenvía a la API una acción del navegador hecha dentro de una demo, agregando el token que
// el navegador no puede leer (la cookie es httpOnly). El tenant sale de la ruta, igual que en
// las lecturas del servidor; nunca de lo que diga la petición.
//
// Consecuencia asumida: para la API todas estas acciones llegan desde la IP del servidor de
// Next, así que comparten su límite de frecuencia. En una demo no hay efectos reales que
// proteger y el volumen es el de una llamada de venta.
export const forwardDemoAction = async ({
  tenantDomain,
  segments,
  request,
  demoToken,
  fetchFn = (input, init) => fetch(input, init),
}: ForwardDemoActionInput): Promise<Response> => {
  const action = toForwardedDemoAction(segments);
  if (action === null || !isDemoToken(demoToken)) {
    return notFound();
  }

  const headers: Record<string, string> = {
    [TENANT_DOMAIN_HEADER]: tenantDomain,
    [DEMO_TOKEN_HEADER]: demoToken,
  };
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value !== null) {
      headers[name] = value;
    }
  }

  const search = new URL(request.url).search;
  let upstream: Response;
  try {
    upstream = await fetchFn(`${getApiBaseUrl()}/api/${action}${search}`, {
      method: request.method,
      headers,
      body: await request.text(),
      cache: 'no-store',
    });
  } catch {
    return new Response(null, { status: 502, headers: DEMO_RESPONSE_HEADERS });
  }

  const contentType = upstream.headers.get('content-type');
  // Un 204 no puede llevar cuerpo, ni siquiera vacío: `Response` lo rechaza.
  const body = NULL_BODY_STATUSES.has(upstream.status) ? null : await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: {
      ...DEMO_RESPONSE_HEADERS,
      ...(contentType === null ? {} : { 'Content-Type': contentType }),
    },
  });
};
