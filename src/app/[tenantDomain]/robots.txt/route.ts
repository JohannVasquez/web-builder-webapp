import { NextResponse, type NextRequest } from 'next/server';
import { createGlobalSettingsService } from '@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory';
import { isUnderConstruction } from '@/modules/GlobalSettings/domain/GlobalSettings';

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
