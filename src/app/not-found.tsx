import type { ReactElement } from 'react';
import type { Metadata } from 'next';
import { PageNotFound } from '@/modules/Page/presentation/PageNotFound';

export const metadata: Metadata = {
  title: 'Página no encontrada',
};

export default function NotFound(): ReactElement {
  return <PageNotFound />;
}
