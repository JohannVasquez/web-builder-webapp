'use client';

import type { Order } from '../domain/StoreApi';
import {
  formatMoney,
  getOrderStatusLabel,
  getAvailableNextStatuses,
  describeDelivery,
  formatPlace,
} from '../application/storePresentation';
import { Button } from '@/shared/ui/button';

export interface OrderListProps {
  readonly orders: readonly Order[];
  readonly onAdvanceStatus: (order: Order, nextStatus: string) => void;
  readonly onRetryEmail: (order: Order) => void;
  readonly retryingOrderId: string | null;
}

import { Loader2, AlertCircle } from 'lucide-react';

export const OrderList = ({
  orders,
  onAdvanceStatus,
  onRetryEmail,
  retryingOrderId,
}: OrderListProps): import('react').ReactElement | null => {
  if (orders.length === 0) {
    return <p className="text-muted-foreground">No hay pedidos en este período.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const nextStatuses = getAvailableNextStatuses(order.status);
        const hasEmailError = order.confirmationEmailError !== null;
        const isRetrying = retryingOrderId === order.id;

        return (
          <div
              key={order.id}
              className={`border rounded-lg p-4 bg-card flex flex-col gap-4 ${hasEmailError ? 'border-destructive ring-1 ring-destructive' : ''}`}
            >
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-lg">Pedido #{order.number}</h4>
                    {hasEmailError && (
                      <span className="flex items-center gap-1 text-destructive text-sm font-semibold ml-2">
                        <AlertCircle className="size-4" aria-hidden="true" />
                        <span className="sr-only">Atención: </span>
                        Fallo en correo
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {new Date(order.createdAt).toLocaleString('es-CL')}
                  </div>
                </div>
              <div className="flex flex-col items-end gap-2">
                <span className="bg-secondary px-3 py-1 rounded-full text-sm font-medium">
                  {getOrderStatusLabel(order.status)}
                </span>
                <span className="font-bold text-lg">
                  {formatMoney(order.totalCents, order.currency)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-semibold mb-1">Cliente</h5>
                <p>{order.customer.name}</p>
                <p>{order.customer.email}</p>
                <p>{order.customer.phone}</p>
                {order.termsAcceptedAt !== null && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Aceptó los términos de compra el{' '}
                    {new Date(order.termsAcceptedAt).toLocaleString('es-CL', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                )}
              </div>
              <div>
                <h5 className="font-semibold mb-1">Envío / Entrega</h5>
                <p>{describeDelivery(order.delivery)}</p>
                {order.delivery.addressLine && <p>{order.delivery.addressLine}</p>}
                {formatPlace(order.delivery) !== '' && (
                  <p>{formatPlace(order.delivery)}</p>
                )}
              </div>
            </div>

            <div className="border-t pt-4">
              <h5 className="font-semibold mb-2">Artículos</h5>
              <ul className="space-y-2">
                {order.items.map((item, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.name}
                      {Object.keys(item.variant).length > 0 && (
                        <span className="text-muted-foreground ml-1">
                          ({Object.values(item.variant).join(', ')})
                        </span>
                      )}
                    </span>
                    <span>{formatMoney(item.totalCents, order.currency)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {hasEmailError && (
              <div
                className="bg-destructive/10 text-destructive p-3 rounded-md flex flex-wrap sm:flex-nowrap items-start justify-between gap-4 mt-2"
                role="alert"
                aria-live="polite"
              >
                <div className="flex-1">
                  <p className="font-semibold text-sm">El correo de confirmación no se pudo entregar</p>
                  <p className="text-sm mt-1">{order.confirmationEmailError}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => onRetryEmail(order)}
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Reintentando...
                    </>
                  ) : (
                    'Reintentar envío'
                  )}
                </Button>
              </div>
            )}

            {nextStatuses.length > 0 && (
              <div className="border-t pt-4 flex gap-2 flex-wrap">
                {nextStatuses.map((next) => (
                  <Button
                    key={next}
                    variant={next === 'cancelled' ? 'destructive' : 'default'}
                    onClick={() => onAdvanceStatus(order, next)}
                  >
                    Marcar como {getOrderStatusLabel(next)}
                  </Button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
