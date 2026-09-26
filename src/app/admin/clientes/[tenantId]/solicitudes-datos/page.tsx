import type { ReactElement } from 'react';
import { DataRightsRequests } from '@/modules/Admin/presentation/DataRightsRequests';

interface PageProps {
  readonly params: Promise<{ readonly tenantId: string }>;
}

export default async function DataRightsRequestsPage({ params }: PageProps): Promise<ReactElement> {
  const { tenantId } = await params;
  return <DataRightsRequests tenantId={tenantId} />;
}
