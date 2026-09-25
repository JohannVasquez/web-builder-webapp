import type { ReactElement } from 'react';
import { BusinessSettingsForm } from '@/modules/Admin/presentation/BusinessSettingsForm';

interface Props {
  readonly params: Promise<{ tenantId: string }>;
}

export default async function BusinessSettingsPage({
  params,
}: Props): Promise<ReactElement> {
  const { tenantId } = await params;
  return <BusinessSettingsForm tenantId={tenantId} />;
}
