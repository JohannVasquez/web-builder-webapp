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
}

export const OrderList = ({
  orders,
  onAdvanceStatus,
}: OrderListProps): import('react').ReactElement | null => {
  if (orders.length === 0) {
    return <p className="text-muted-foreground">No hay pedidos en este período.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const nextStatuses = getAvailableNextStatuses(order.status);

        return (
          <div
            key={order.id}
            className="border rounded-lg p-4 bg-card flex flex-col gap-4"
          >
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h4 className="font-bold text-lg">Pedido #{order.number}</h4>
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
              </div>
              <div>
                <h5 className="font-semibold mb-1">Envío / Entrega</h5>
                <p>{describeDelivery(order.delivery)}</p>
                {order.delivery.addressLine && <p>{order.delivery.addressLine}</p>}
                {formatPlace(order.delivery) !== '' && <p>{formatPlace(order.delivery)}</p>}
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
