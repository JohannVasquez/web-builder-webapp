import type { ReactElement } from 'react';
import { LegalPagesManager } from '@/modules/Admin/presentation/LegalPagesManager';

interface LegalPagesPageProps {
  readonly params: Promise<{ tenantId: string }>;
}

export default async function LegalPagesPage({
  params,
}: LegalPagesPageProps): Promise<ReactElement> {
  const { tenantId } = await params;
  return <LegalPagesManager tenantId={tenantId} />;
}
