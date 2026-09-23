import type { ReactElement } from 'react';
import { BlogManager } from '@/modules/Admin/presentation/BlogManager';

interface BlogManagerPageProps {
  readonly params: Promise<{ tenantId: string }>;
}

export default async function BlogManagerPage({
  params,
}: BlogManagerPageProps): Promise<ReactElement> {
  const { tenantId } = await params;
  return <BlogManager tenantId={tenantId} />;
}
