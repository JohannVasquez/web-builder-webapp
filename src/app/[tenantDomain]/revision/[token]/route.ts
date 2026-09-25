import { cookies, draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { getApiBaseUrl } from '@/shared/config/api';
import { TENANT_DOMAIN_HEADER } from '@/shared/config/tenant';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tenantDomain: string; token: string }> },
): Promise<void> {
  const { tenantDomain, token } = await params;

  if (!/^[0-9a-f]{64}$/.test(token)) {
    redirect('/revision/invalida?reason=invalid');
  }

  // Validate token against API
  const response = await fetch(`${getApiBaseUrl()}/api/settings`, {
    headers: {
      [TENANT_DOMAIN_HEADER]: tenantDomain,
      'x-preview-token': token,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 403 || response.status === 404) {
      const body = (await response.json().catch(() => ({}))) as { code?: string };
      const code = body.code ?? 'invalid';
      redirect(`/revision/invalida?reason=${code}`);
    }
    // Si falla por otra cosa (e.g. 500), 404 genérico o error
    redirect('/revision/invalida?reason=error');
  }

  const dm = await draftMode();
  dm.enable();

  const c = await cookies();
  c.set('preview_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  redirect('/');
}
