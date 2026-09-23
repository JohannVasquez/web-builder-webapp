import type { ReactElement } from 'react';
import { PostEditor } from '@/modules/Admin/presentation/PostEditor';

interface EditPostPageProps {
  readonly params: Promise<{ tenantId: string; postId: string }>;
}

export default async function EditPostPage({
  params,
}: EditPostPageProps): Promise<ReactElement> {
  const { tenantId, postId } = await params;
  return <PostEditor tenantId={tenantId} postId={postId} />;
}
