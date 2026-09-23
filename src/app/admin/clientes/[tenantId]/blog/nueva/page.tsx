import type { ReactElement } from 'react';
import { PostEditor } from '@/modules/Admin/presentation/PostEditor';

interface NewPostPageProps {
  readonly params: Promise<{ tenantId: string }>;
}

export default async function NewPostPage({
  params,
}: NewPostPageProps): Promise<ReactElement> {
  const { tenantId } = await params;
  return <PostEditor tenantId={tenantId} />;
}
