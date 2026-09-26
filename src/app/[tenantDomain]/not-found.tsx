import type { ReactElement } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { PageNotFound } from '@/modules/Page/presentation/PageNotFound';
import { createNavigationService } from '@/modules/Navigation/infrastructure/navigationServiceFactory';

export const metadata: Metadata = {
  title: 'Página no encontrada',
};

export default async function TenantNotFound(): Promise<ReactElement> {
  const headersList = await headers();
  const host = headersList.get('host') ?? '';
  const tenantDomain = host.split(':')[0]?.toLowerCase();

  const links = await createNavigationService(tenantDomain).getLinks();

  // Sin volcar las cabeceras al registro: entre ellas viaja la cookie con el token de una demo.
  return <PageNotFound links={links} />;
}
