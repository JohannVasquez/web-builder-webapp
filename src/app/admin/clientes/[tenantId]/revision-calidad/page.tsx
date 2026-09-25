import type { ReactElement } from 'react';
import { SiteQualityReviewPanel } from '@/modules/Admin/presentation/SiteQualityReviewPanel';

interface RevisionCalidadPageProps {
  readonly params: Promise<{ tenantId: string }>;
}

export default async function RevisionCalidadPage({
  params,
}: RevisionCalidadPageProps): Promise<ReactElement> {
  const { tenantId } = await params;
  return <SiteQualityReviewPanel tenantId={tenantId} />;
}
