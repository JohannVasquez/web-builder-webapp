import { NextResponse, type NextRequest } from 'next/server';

// La guía de estilos y las rutas internas no se indexan: son herramientas de la agencia.
const DISALLOWED = ['/styleguide', '/api/', '/brand-asset/'];

export function GET(request: NextRequest): NextResponse {
  const origin = new URL(request.url).origin;
  const body = [
    'User-agent: *',
    ...DISALLOWED.map((path) => `Disallow: ${path}`),
    'Allow: /',
    '',
    `Sitemap: ${origin}/sitemap.xml`,
    '',
  ].join('\n');

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
