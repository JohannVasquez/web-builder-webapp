import { NextResponse, type NextRequest } from 'next/server';
import { createGlobalSettingsService } from '@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory';
import { isUnderConstruction } from '@/modules/GlobalSettings/domain/GlobalSettings';
import { DEMO_RESPONSE_HEADERS } from '@/shared/config/demo';
import { isDemoRequest } from '@/shared/lib/demoAccess';

// La guía de estilos y las rutas internas no se indexan: son herramientas de la agencia.
const DISALLOWED = ['/styleguide', '/api/', '/brand-asset/'];

// Las rutas de compra no aportan nada en un buscador y la de agradecimiento lleva el detalle
// del pedido en la URL.
const TRANSACTIONAL = ['/tienda/carrito', '/tienda/comprar', '/tienda/gracias'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenantDomain: string }> },
): Promise<NextResponse> {
  const { tenantDomain } = await params;

  // Una demo de prospecto se cierra entera y sin preguntarle nada a la API: el rastreador no
  // trae la cookie del enlace, así que la API le respondería 404 de todos modos.
  if (await isDemoRequest(tenantDomain)) {
    return new NextResponse(['User-agent: *', 'Disallow: /', ''].join('\n'), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', ...DEMO_RESPONSE_HEADERS },
    });
  }

  const origin = new URL(request.url).origin;
  const settings = await createGlobalSettingsService(tenantDomain).getSettings();

  // Un sitio en construcción se cierra entero. Sigue sirviendo el sitemap para que el
  // cliente pueda revisarlo, pero no invita a nadie a rastrearlo.
  const body = isUnderConstruction(settings)
    ? ['User-agent: *', 'Disallow: /', ''].join('\n')
    : [
        'User-agent: *',
        ...[...DISALLOWED, ...TRANSACTIONAL].map((path) => `Disallow: ${path}`),
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
