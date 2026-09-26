import type { NextRequest } from 'next/server';
import { DEMO_TOKEN_COOKIE } from '@/shared/config/demo';
import { forwardDemoAction } from '@/modules/Demo/infrastructure/forwardDemoAction';

// Acciones del navegador dentro de una demo de prospecto (contacto, newsletter, carrito,
// compra, consentimiento...). Ver `DEMO_ACTIONS_BASE_URL` en `@/shared/config/demo`.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenantDomain: string; path: string[] }> },
): Promise<Response> {
  const { tenantDomain, path } = await params;
  return forwardDemoAction({
    tenantDomain,
    segments: path,
    request,
    demoToken: request.cookies.get(DEMO_TOKEN_COOKIE)?.value,
  });
}
