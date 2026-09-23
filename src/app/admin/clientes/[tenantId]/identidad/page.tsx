import type { ReactElement } from 'react';
import { BrandEditor } from '@/modules/Admin/presentation/BrandEditor';

interface BrandEditorPageProps {
  readonly params: Promise<{ tenantId: string }>;
}

export default async function BrandEditorPage({
  params,
}: BrandEditorPageProps): Promise<ReactElement> {
  const { tenantId } = await params;
  return <BrandEditor tenantId={tenantId} />;
}
