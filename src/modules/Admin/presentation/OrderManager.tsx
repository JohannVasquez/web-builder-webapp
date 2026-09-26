'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAdminApi } from './useAdminApi';
import { describeAdminError } from '../application/adminErrorMessage';
import { useAsyncData, refreshAsyncData } from '@/shared/lib/useAsyncData';
import {
  OrderListResponseSchema,
  OrderResponseSchema,
  type Order,
  type OrderStatus,
} from '../domain/StoreApi';
import { OrderList } from './OrderList';
import {
  endOfLocalDayIso,
  getOrderStatusLabel,
  startOfLocalDayIso,
} from '../application/storePresentation';
import { Input } from '@/shared/ui/input';

export interface OrderManagerProps {
  readonly tenantId: string;
}

export const OrderManager = ({
  tenantId,
}: OrderManagerProps): import('react').ReactElement | null => {
  const api = useAdminApi();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // URL can be constructed carefully to append query params
  const url = new URL(`/api/admin/tenants/${tenantId}/store/orders`, 'http://localhost');
  if (statusFilter) {
    url.searchParams.set('status', statusFilter);
  }
  if (fromDate) {
    url.searchParams.set('from', startOfLocalDayIso(fromDate) ?? fromDate);
  }
  if (toDate) {
    url.searchParams.set('to', endOfLocalDayIso(toDate) ?? toDate);
  }

  // Unique cache key based on filters so changing filter re-fetches or uses correct cache
  const cacheKey = `admin:orders:${tenantId}:status=${statusFilter}:from=${fromDate}:to=${toDate}`;

  const { data, isLoading, error } = useAsyncData(cacheKey, () =>
    api.get(url.pathname + url.search, OrderListResponseSchema),
  );

  // Los pedidos llegan desde el sitio, no desde el panel: sin volver a consultar al abrir la
  // pestaña, una compra hecha con el panel ya abierto no aparecería hasta recargar la página.
  useEffect(() => {
    refreshAsyncData(cacheKey);
  }, [cacheKey]);

  const [saving, setSaving] = useState(false);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

  const handleAdvanceStatus = async (order: Order, nextStatus: string): Promise<void> => {
    let confirmMessage = `¿Estás seguro de marcar el pedido como ${getOrderStatusLabel(nextStatus as OrderStatus)}?`;
    if (nextStatus === 'paid') {
      confirmMessage +=
        '\n\nNOTA: Marcar como pagado descontará el stock y enviará correos al cliente.';
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setSaving(true);
    try {
      await api.patch(
        `/api/admin/tenants/${tenantId}/store/orders/${order.id}/status`,
        { status: nextStatus },
        OrderResponseSchema,
      );
      toast.success('Estado del pedido actualizado.');
      refreshAsyncData(cacheKey);
    } catch (err) {
      toast.error(describeAdminError(err, 'Error al actualizar el pedido.').message);
    } finally {
      setSaving(false);
    }
  };

  const handleRetryEmail = async (order: Order): Promise<void> => {
    setRetryingOrderId(order.id);
    try {
      const response = await api.post(
        `/api/admin/tenants/${tenantId}/store/retry-confirmation`,
        {},
        z.object({ retried: z.number() })
      );
      if (response.retried > 0) {
        toast.success(`Se reintentó el envío de ${response.retried} correo(s).`);
      } else {
        toast.error('El reintento volvió a fallar. Revisa los registros.');
      }
      refreshAsyncData(cacheKey);
    } catch (err) {
      toast.error(describeAdminError(err, 'Error al reintentar el correo.').message);
    } finally {
      setRetryingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h3 className="font-semibold text-lg">Pedidos</h3>

        <div className="flex flex-wrap items-end gap-4 bg-card p-4 rounded-lg border">
          <div className="space-y-2">
            <label htmlFor="statusFilter" className="text-sm font-medium">
              Estado:
            </label>
            <select
              id="statusFilter"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="pending">Pendiente de pago</option>
              <option value="paid">Pagado</option>
              <option value="preparing">En preparación</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="fromDate" className="text-sm font-medium">
              Desde:
            </label>
            <Input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="toDate" className="text-sm font-medium">
              Hasta:
            </label>
            <Input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center p-8 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">{error}</div>
      )}

      {data && !isLoading && !error && (
        <>
          {saving && (
            <div className="text-sm text-muted-foreground mb-4">
              Actualizando pedido...
            </div>
          )}
          <OrderList
            orders={data.orders}
            onAdvanceStatus={(order, nextStatus) => {
              void handleAdvanceStatus(order, nextStatus);
            }}
            onRetryEmail={(order) => {
              void handleRetryEmail(order);
            }}
            retryingOrderId={retryingOrderId}
          />
        </>
      )}
    </div>
  );
};

export { OrderList } from './OrderList';
