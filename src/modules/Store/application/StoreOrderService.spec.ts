import { StoreOrderService } from './StoreOrderService';
import type { QuoteRequest, QuoteResponse } from '../domain/Quote';

const quoteResponse: QuoteResponse = {
  lines: [],
  totals: {
    subtotalCents: 0,
    discountCents: 0,
    shippingCents: 0,
    totalCents: 0,
    taxCents: 0,
  },
  currency: 'CLP',
  coupon: null,
  couponRejection: null,
  shipping: null,
  availableShipping: [],
  taxIncluded: true,
  taxRatePercent: 19,
  termsPageSlug: null,
};

const request: QuoteRequest = { items: [{ productId: '018f6f1a-0000-7000-8000-000000000001', quantity: 1 }] };

const jsonResponse = (status: number, body: unknown): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  }) as unknown as Response;

describe('StoreOrderService', () => {
  it('sends the tenant header and returns the parsed quote', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(200, quoteResponse));
    const service = new StoreOrderService(
      'http://api.local',
      'tienda.localhost',
      fetchFn,
    );

    const result = await service.quote(request);

    expect(result).toEqual(quoteResponse);
    const [url, init] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.local/api/store/quote');
    expect((init.headers as Record<string, string>)['X-Tenant-Domain']).toBe(
      'tienda.localhost',
    );
  });

  it('throws the message written for the buyer on a 400', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValue(
        jsonResponse(400, { error: 'BadRequest', message: 'Ese cupón no existe.' }),
      );
    const service = new StoreOrderService('http://api.local', undefined, fetchFn);

    await expect(service.quote(request)).rejects.toThrow('Ese cupón no existe.');
  });

  it('throws a generic message when the error body cannot be parsed', async () => {
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(500, {}));
    const service = new StoreOrderService('http://api.local', undefined, fetchFn);

    await expect(service.quote(request)).rejects.toThrow(
      'No pudimos calcular tu pedido. Inténtalo nuevamente.',
    );
  });

  it('posts to /api/store/checkout for checkout', async () => {
    const order = {
      order: {
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
      },
      redirectUrl: null,
      instructions: 'Transfiere a la cuenta X',
    };
    const fetchFn = jest.fn().mockResolvedValue(jsonResponse(201, order));
    const service = new StoreOrderService('http://api.local', undefined, fetchFn);

    const result = await service.checkout({
      items: [{ productId: '018f6f1a-0000-7000-8000-000000000001', quantity: 1 }],
      customer: { name: 'Ana', email: 'ana@test.cl', phone: '+56911112222' },
      delivery: { method: 'pickup' },
    });

    expect(result).toEqual(order);
    const [url] = fetchFn.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.local/api/store/checkout');
  });
});
