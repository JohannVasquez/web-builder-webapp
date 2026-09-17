import { parseThanksData } from './thanksData';
import type { Order } from '../domain/Checkout';

const order: Order = {
  id: 1,
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
