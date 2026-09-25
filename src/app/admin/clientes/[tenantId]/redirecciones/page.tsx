import type { Metadata } from 'next';
import type { ReactElement } from 'react';
import { TenantRedirects } from '@/modules/Admin/presentation/TenantRedirects';

export const metadata: Metadata = {
  title: 'Redirecciones',
};

interface RedireccionesPageProps {
  readonly params: Promise<{ tenantId: string }>;
}

export default async function RedireccionesPage({
  params,
}: RedireccionesPageProps): Promise<ReactElement> {
  const { tenantId } = await params;
  return <TenantRedirects tenantId={tenantId} />;
}
