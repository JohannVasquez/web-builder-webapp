import { NextResponse, type NextRequest } from 'next/server';
import { createGlobalSettingsService } from '@/modules/GlobalSettings/infrastructure/globalSettingsServiceFactory';
import type { Brand } from '@/modules/Brand/domain/Brand';

// Las URLs del bucket son firmadas y expiran en una hora, así que no sirven como `og:image`:
// el rastreador de WhatsApp puede pedirla mucho después y el enlace compartido quedaría roto.
// Esta ruta es estable y redirige a una firma fresca en cada visita.
const ASSETS: Readonly<Record<string, keyof Brand['assets']>> = {
  'logo-light': 'logoLight',
  'logo-dark': 'logoDark',
  favicon: 'favicon',
  'og-image': 'ogImage',
};

const CACHE_SECONDS = 600;

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ tenantDomain: string; asset: string }> },
): Promise<NextResponse> {
  const { tenantDomain, asset } = await params;
  const field = ASSETS[asset];
  if (field === undefined) {
    return new NextResponse('Recurso de marca desconocido', { status: 404 });
  }

  const settings = await createGlobalSettingsService(tenantDomain).getSettings();
  const url = settings.brand.assets[field];
  if (url === undefined || url === '') {
    return new NextResponse('Este cliente no tiene ese recurso de marca', { status: 404 });
  }

  // Menos que la hora que dura la firma, para no redirigir nunca a una URL ya vencida.
  return NextResponse.redirect(url, {
    status: 307,
    headers: { 'Cache-Control': `public, max-age=${CACHE_SECONDS}` },
  });
}
