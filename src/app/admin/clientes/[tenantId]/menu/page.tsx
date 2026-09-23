import type { ReactElement } from 'react';
import { TenantNavigation } from '@/modules/Admin/presentation/TenantNavigation';

interface TenantNavigationPageProps {
  readonly params: Promise<{ tenantId: string }>;
}

export default async function TenantNavigationPage({
  params,
}: TenantNavigationPageProps): Promise<ReactElement> {
  const { tenantId } = await params;
  return <TenantNavigation tenantId={tenantId} />;
}
