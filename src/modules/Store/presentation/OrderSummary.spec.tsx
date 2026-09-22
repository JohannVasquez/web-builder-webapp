import { renderToStaticMarkup } from 'react-dom/server';
import type { QuoteResponse } from '../domain/Quote';
import { OrderSummary } from './OrderSummary';

const baseQuote: QuoteResponse = {
  lines: [],
  totals: {
    subtotalCents: 24990,
    discountCents: 0,
    shippingCents: 0,
    totalCents: 24990,
    taxCents: 3990,
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

describe('OrderSummary', () => {
  it('muestra el subtotal y el total formateados', () => {
    const html = renderToStaticMarkup(<OrderSummary quote={baseQuote} />);
    expect(html).toContain('$24.990');
  });

  it('sin envío muestra "Gratis"', () => {
    const html = renderToStaticMarkup(<OrderSummary quote={baseQuote} />);
    expect(html).toContain('Gratis');
  });

  it('con envío muestra el costo formateado', () => {
    const quote: QuoteResponse = {
      ...baseQuote,
      totals: { ...baseQuote.totals, shippingCents: 3990 },
    };
    const html = renderToStaticMarkup(<OrderSummary quote={quote} />);
    expect(html).toContain('$3.990');
    expect(html).not.toContain('Gratis');
  });

  it('sin descuento no muestra la fila de descuento', () => {
    const html = renderToStaticMarkup(<OrderSummary quote={baseQuote} />);
    expect(html).not.toContain('Descuento');
  });

  it('con descuento muestra la fila de descuento', () => {
    const quote: QuoteResponse = {
      ...baseQuote,
      totals: { ...baseQuote.totals, discountCents: 2499 },
    };
    const html = renderToStaticMarkup(<OrderSummary quote={quote} />);
    expect(html).toContain('Descuento');
    expect(html).toContain('$2.499');
  });

  it('con cupón rechazado muestra el mensaje, sin bloquear el resto del resumen', () => {
    const quote: QuoteResponse = {
      ...baseQuote,
      couponRejection: 'Ese cupón no existe.',
    };
    const html = renderToStaticMarkup(<OrderSummary quote={quote} />);
    expect(html).toContain('Ese cupón no existe.');
    expect(html).toContain('Total');
  });

  it('con cupón aplicado muestra el código y el descuento', () => {
    const quote: QuoteResponse = {
      ...baseQuote,
      coupon: { code: 'DULCE10', discountCents: 2499 },
    };
    const html = renderToStaticMarkup(<OrderSummary quote={quote} />);
    expect(html).toContain('DULCE10');
  });
});
