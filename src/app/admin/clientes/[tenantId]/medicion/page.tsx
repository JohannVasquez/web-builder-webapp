import type { ReactElement } from 'react';
import { VisibilitySettingsForm } from '@/modules/Admin/presentation/VisibilitySettingsForm';

interface Props {
  readonly params: Promise<{ tenantId: string }>;
}

export default async function VisibilitySettingsPage({
  params,
}: Props): Promise<ReactElement> {
  const { tenantId } = await params;
  return <VisibilitySettingsForm tenantId={tenantId} />;
}
