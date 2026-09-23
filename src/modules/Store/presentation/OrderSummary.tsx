import type { ReactElement } from 'react';
import type { QuoteResponse } from '../domain/Quote';
import { formatClp } from './money';

interface OrderSummaryProps {
  readonly quote: QuoteResponse;
}

// Resumen de totales de la compra (SPEC 8.2): subtotal, descuento, envío, IVA y total. Recibe
// la cotización ya resuelta por props para poder probarlo con `renderToStaticMarkup` sin
// mockear ningún `fetch`; quien lo usa (carrito, comprar) es responsable de pedirla a
// `POST /api/store/quote`.
export function OrderSummary({ quote }: OrderSummaryProps): ReactElement {
  const { totals, coupon, couponRejection, taxIncluded, taxRatePercent } = quote;

  return (
    <div className="ui-card flex flex-col gap-3 p-6">
      <h2 className="text-lg font-semibold">Resumen</h2>

      {couponRejection !== null && (
        <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
          {couponRejection}
        </p>
      )}

      {coupon !== null && (
        <p className="text-sm text-emerald-600">
          Cupón {coupon.code} aplicado: -{formatClp(coupon.discountCents)}
        </p>
      )}

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd>{formatClp(totals.subtotalCents)}</dd>
        </div>
        {totals.discountCents > 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Descuento</dt>
            <dd>-{formatClp(totals.discountCents)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Envío</dt>
          <dd>
            {totals.shippingCents === 0 ? 'Gratis' : formatClp(totals.shippingCents)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            IVA ({taxRatePercent}%{taxIncluded ? ', incluido' : ''})
          </dt>
          <dd>{formatClp(totals.taxCents)}</dd>
        </div>
        <div className="border-border mt-1 flex justify-between border-t pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd>{formatClp(totals.totalCents)}</dd>
        </div>
      </dl>
    </div>
  );
}
