import type { ReactElement } from 'react';
import { StoreContainer } from '@/modules/Admin/presentation/StoreContainer';

interface TenantStorePageProps {
  readonly params: Promise<{ tenantId: string }>;
}

export default async function TenantStorePage({
  params,
}: TenantStorePageProps): Promise<ReactElement> {
  const { tenantId } = await params;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tienda</h1>
        <p className="text-muted-foreground">Administra los productos, pedidos y ajustes de la tienda.</p>
      </div>
      <StoreContainer tenantId={tenantId} />
    </div>
  );
}
