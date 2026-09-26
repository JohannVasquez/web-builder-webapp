import { afterCheckout, parseThanksData } from './thanksData';
import type { Order } from '../domain/Checkout';

const order: Order = {
  id: '018f6f1a-0000-7000-8000-000000000001',
  number: '0001',
  status: 'pending',
  statusLabel: 'Pendiente de pago',
  customer: { name: 'Ana', email: 'ana@test.cl', phone: '+56911112222' },
  delivery: {
    method: 'pickup',
    shippingName: null,
    addressLine: null,
    addressCity: null,
    addressRegion: null,
    addressNotes: null,
  },
  items: [],
  subtotalCents: 0,
  discountCents: 0,
  shippingCents: 0,
  taxCents: 0,
  totalCents: 0,
  currency: 'CLP',
  couponCode: null,
  paymentProvider: 'transfer',
  paidAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('parseThanksData', () => {
  it('sin valor devuelve null', () => {
    expect(parseThanksData(undefined)).toBeNull();
  });

  it('con un JSON que no calza con el contrato devuelve null', () => {
    expect(parseThanksData(JSON.stringify({ hola: 'mundo' }))).toBeNull();
  });

  it('con texto que no es JSON devuelve null en vez de lanzar', () => {
    expect(parseThanksData('esto no es json')).toBeNull();
  });

  it('con el pedido y las instrucciones, los devuelve', () => {
    const raw = JSON.stringify({ order, instructions: 'Transfiere a la cuenta X' });
    expect(parseThanksData(raw)).toEqual({
      order,
      instructions: 'Transfiere a la cuenta X',
    });
  });

  it('sin instrucciones (pago no transferencia) acepta null', () => {
    const raw = JSON.stringify({ order, instructions: null });
    expect(parseThanksData(raw)).toEqual({ order, instructions: null });
  });
});

describe('afterCheckout', () => {
  const origin = 'https://demo-luna.webbuilder.cl';
  const paid: Order = { ...order, status: 'paid', paymentProvider: 'demo' };

  it('un medio de pago externo se lleva a quien compra a su sitio', () => {
    expect(
      afterCheckout(
        { order, redirectUrl: 'https://www.flow.cl/app/pay?token=x', instructions: null },
        origin,
      ),
    ).toEqual({ kind: 'external', url: 'https://www.flow.cl/app/pay?token=x' });
  });

  it('el pago simulado de una demo vuelve a nuestra página de gracias con el detalle', () => {
    const next = afterCheckout(
      { order: paid, redirectUrl: `${origin}/tienda/gracias`, instructions: null },
      origin,
    );

    expect(next.kind).toBe('thanks');
    const path = next.kind === 'thanks' ? next.path : '';
    expect(path.startsWith('/tienda/gracias?data=')).toBe(true);
    const data = decodeURIComponent(path.slice('/tienda/gracias?data='.length));
    expect(parseThanksData(data)?.order.number).toBe('0001');
  });

  it('sin redirección (transferencia) muestra el detalle y las instrucciones', () => {
    const next = afterCheckout(
      { order, redirectUrl: null, instructions: 'Transfiere a la cuenta 123' },
      origin,
    );
    const path = next.kind === 'thanks' ? next.path : '';
    const data = decodeURIComponent(path.slice('/tienda/gracias?data='.length));
    expect(parseThanksData(data)?.instructions).toBe('Transfiere a la cuenta 123');
  });

  it('una página de gracias de otro dominio no se trata como propia', () => {
    expect(
      afterCheckout(
        { order, redirectUrl: 'https://otro.cl/tienda/gracias', instructions: null },
        origin,
      ).kind,
    ).toBe('external');
  });
});
