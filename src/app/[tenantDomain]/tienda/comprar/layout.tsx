import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';
import { NO_INDEX } from '@/shared/lib/seo';

// El pago es una página de cliente y no puede exportar `metadata`: el `noindex` vive aquí.
export const metadata: Metadata = { robots: NO_INDEX };

export default function CheckoutLayout({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return <>{children}</>;
}
