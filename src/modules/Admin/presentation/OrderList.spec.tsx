import { renderToStaticMarkup } from 'react-dom/server';
import { OrderList } from './OrderList';
import type { Order } from '../domain/StoreApi';

describe('OrderList', () => {
  const baseOrder: Order = {
    id: '018f6f1a-0000-7000-8000-000000000001',
    number: 'ORD-001',
    status: 'pending',
    statusLabel: 'Pendiente',
    customer: {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      phone: '+56912345678',
    },
    delivery: {
      method: 'shipping',
      shippingName: 'Despacho normal',
      addressLine: 'Calle Falsa 123',
      addressCity: 'Santiago',
      addressRegion: 'RM',
      addressNotes: null,
    },
    items: [
      {
        productId: '018f6f1a-0000-7000-8000-000000000001',
        name: 'Torta de chocolate',
        variant: { tamaño: 'Grande' },
        unitPriceCents: 15000,
        quantity: 1,
        totalCents: 15000,
      },
    ],
    subtotalCents: 15000,
    discountCents: 0,
    shippingCents: 3000,
    taxCents: 2874,
    totalCents: 18000,
    currency: 'CLP',
    couponCode: null,
    paymentProvider: 'flow',
    paidAt: null,
    createdAt: '2026-09-22T04:00:00Z',
    termsAcceptedAt: null,
    termsVersion: null,
  };

  it('renders correctly', () => {
    const html = renderToStaticMarkup(
      <OrderList orders={[baseOrder]} onAdvanceStatus={() => {}} />,
    );
    expect(html).toContain('ORD-001');
    expect(html).toContain('Juan Pérez');
    expect(html).toContain('18.000');
    expect(html).toContain('Marcar como Pagado'); // Next status for pending
  });

  it('shows shipped status without payment next step', () => {
    const order: Order = { ...baseOrder, status: 'shipped' };
    const html = renderToStaticMarkup(
      <OrderList orders={[order]} onAdvanceStatus={() => {}} />,
    );
    expect(html).toContain('Enviado');
    expect(html).toContain('Marcar como Entregado');
    expect(html).not.toContain('Marcar como Pagado');
  });

  it('muestra la constancia cuando el comprador aceptó los términos', () => {
    const html = renderToStaticMarkup(
      <OrderList
        orders={[
          {
            ...baseOrder,
            termsAcceptedAt: '2026-09-22T14:17:29.234Z',
            termsVersion: 'v1',
          },
        ]}
        onAdvanceStatus={() => undefined}
      />,
    );

    expect(html).toContain('Aceptó los términos de compra');
  });
});
