import type { ReactElement } from 'react';
import { MediaLibrary } from '@/modules/Admin/presentation/MediaLibrary';

interface MediaLibraryPageProps {
  readonly params: Promise<{ tenantId: string }>;
}

export default async function MediaLibraryPage({
  params,
}: MediaLibraryPageProps): Promise<ReactElement> {
  const { tenantId } = await params;
  return <MediaLibrary tenantId={tenantId} />;
}
