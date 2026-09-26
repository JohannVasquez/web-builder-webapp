import { NextResponse, type NextRequest } from 'next/server';
import {
  DEMO_RESPONSE_HEADERS,
  DEMO_TOKEN_COOKIE,
  demoCookieOptions,
} from '@/shared/config/demo';
import { verifyDemoToken } from './verifyDemoToken';

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

// Ruta interna que responde el 404 normal del sitio (`src/app/[tenantDomain]/demo/[token]`).
// El token no viaja en ella: no hace falta y así no queda en ningún registro de la ruta.
const INVALID_LINK_SEGMENT = 'invalido';

// Canjea `/demo/<token>`: con un enlace válido deja la cookie y manda a la portada, así el
// token desaparece de la barra de direcciones y del historial que se comparte. Con uno que
// no sirve se ve el 404 común, sin decir si venció, si es de otra demo o si nunca existió.
export const redeemDemoLink = async (
  request: NextRequest,
  tenantDomain: string,
  token: string,
  fetchFn?: FetchLike,
): Promise<NextResponse> => {
  if (await verifyDemoToken(tenantDomain, token, fetchFn)) {
    const home = request.nextUrl.clone();
    home.pathname = '/';
    home.search = '';
    const response = NextResponse.redirect(home, { headers: DEMO_RESPONSE_HEADERS });
    response.cookies.set(DEMO_TOKEN_COOKIE, token, demoCookieOptions());
    return response;
  }

  const internal = request.nextUrl.clone();
  internal.pathname = `/${tenantDomain}/demo/${INVALID_LINK_SEGMENT}`;
  internal.search = '';
  return NextResponse.rewrite(internal, { headers: DEMO_RESPONSE_HEADERS });
};
