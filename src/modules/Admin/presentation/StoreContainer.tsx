'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Store as StoreIcon } from 'lucide-react';
import { useAdminApi } from './useAdminApi';
import { describeAdminError } from '../application/adminErrorMessage';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import { StoreSettingsResponseSchema } from '../domain/StoreApi';
import { StoreSettingsForm } from './StoreSettingsForm';
import { ProductManager } from './ProductManager';
import { OrderManager } from './OrderManager';
import { CouponManager } from './CouponManager';
import { SalesReport } from './SalesReport';
import { Button } from '@/shared/ui/button';

export interface StoreContainerProps {
  readonly tenantId: number;
}

const SETTINGS_CACHE_KEY = (tenantId: number): string =>
  `admin:store-settings:${tenantId}`;

export const StoreContainer = ({
  tenantId,
}: StoreContainerProps): import('react').ReactElement | null => {
  const api = useAdminApi();
  const { data, isLoading, error } = useAsyncData(SETTINGS_CACHE_KEY(tenantId), () =>
    api.get(`/api/admin/tenants/${tenantId}/store/settings`, StoreSettingsResponseSchema),
  );

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'orders' | 'products' | 'coupons' | 'report' | 'settings'
  >('orders');

  const handleEnableStore = async (): Promise<void> => {
    if (!data) return;
    setSaving(true);
    try {
      await api.patch(
        `/api/admin/tenants/${tenantId}/store/settings`,
        { isEnabled: true },
        StoreSettingsResponseSchema,
      );
      toast.success('Tienda encendida correctamente.');
      refreshAsyncData(SETTINGS_CACHE_KEY(tenantId));
    } catch (err) {
      toast.error(describeAdminError(err, 'Error al encender la tienda.').message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        {error ?? 'Error al cargar la tienda.'}
      </div>
    );
  }

  const { store } = data;

  if (!store.isEnabled && activeTab !== 'settings') {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-card text-center space-y-4">
        <div className="bg-muted p-4 rounded-full">
          <StoreIcon className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">La tienda está apagada</h2>
        <p className="text-muted-foreground max-w-md">
          Actualmente, la tienda no está visible para tus clientes y no se pueden recibir
          pedidos. Enciende la tienda para empezar a vender.
        </p>
        <div className="flex gap-4 pt-4">
          <Button
            onClick={() => {
              void handleEnableStore();
            }}
            disabled={saving}
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Encender tienda
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('settings')}>
            Ir a configuración
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'orders', label: 'Pedidos' },
    { id: 'products', label: 'Productos' },
    { id: 'coupons', label: 'Cupones' },
    { id: 'report', label: 'Reportes' },
    { id: 'settings', label: 'Configuración' },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b overflow-x-auto pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors
              ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-2">
        {activeTab === 'orders' && <OrderManager tenantId={tenantId} />}
        {activeTab === 'products' && <ProductManager tenantId={tenantId} />}
        {activeTab === 'coupons' && <CouponManager tenantId={tenantId} />}
        {activeTab === 'report' && <SalesReport tenantId={tenantId} />}
        {activeTab === 'settings' && <StoreSettingsForm tenantId={tenantId} />}
      </div>
    </div>
  );
};
