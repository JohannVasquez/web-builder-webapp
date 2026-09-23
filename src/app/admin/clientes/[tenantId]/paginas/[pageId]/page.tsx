import type { ReactElement } from 'react';
import { PageEditor } from '@/modules/Admin/presentation/PageEditor';

interface PageEditorPageProps {
  readonly params: Promise<{ tenantId: string; pageId: string }>;
}

export default async function PageEditorPage({
  params,
}: PageEditorPageProps): Promise<ReactElement> {
  const { tenantId, pageId } = await params;
  return <PageEditor tenantId={tenantId} pageId={pageId} />;
}
