import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { AdminShell } from '@/modules/Admin/presentation/AdminShell';
import { Toaster } from '@/shared/ui/sonner';
import { AdminProviders } from './providers';

export const metadata: Metadata = {
  title: 'Panel — Web Builder',
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return (
    <AdminProviders>
      <AdminShell>{children}</AdminShell>
      <Toaster position="top-center" richColors />
    </AdminProviders>
  );
}
