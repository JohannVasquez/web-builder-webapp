import type { ReactElement } from 'react';
import { ContactMessages } from '@/modules/Admin/presentation/ContactMessages';

interface ContactMessagesPageProps {
  readonly params: Promise<{ tenantId: string }>;
}

export default async function ContactMessagesPage({
  params,
}: ContactMessagesPageProps): Promise<ReactElement> {
  const { tenantId } = await params;
  return <ContactMessages tenantId={tenantId} />;
}
