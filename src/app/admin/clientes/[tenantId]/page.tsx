import type { ReactElement } from 'react';
import { TenantDetail } from '@/modules/Admin/presentation/TenantDetail';

interface TenantDetailPageProps {
  readonly params: Promise<{ tenantId: string }>;
}

export default async function TenantDetailPage({
  params,
}: TenantDetailPageProps): Promise<ReactElement> {
  const { tenantId } = await params;
  return <TenantDetail tenantId={tenantId} />;
}
