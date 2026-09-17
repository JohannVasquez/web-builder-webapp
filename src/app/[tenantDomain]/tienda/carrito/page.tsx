'use client';

import Link from 'next/link';
import { useMemo, type ReactElement } from 'react';
import { Trash2 } from 'lucide-react';
import { useCart } from '@/modules/Store/presentation/CartProvider';
import { OrderSummary } from '@/modules/Store/presentation/OrderSummary';
import { formatClp } from '@/modules/Store/presentation/money';
import { StoreOrderService } from '@/modules/Store/application/StoreOrderService';
import { variantsMatch } from '@/modules/Store/application/cartLogic';
import type { QuoteResponse } from '@/modules/Store/domain/Quote';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import { getPublicApiBaseUrl } from '@/shared/config/api';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

const EMPTY_QUOTE: QuoteResponse = {
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
  taxRatePercent: 0,
};

// Los precios que se muestran acá SIEMPRE los manda `/api/store/quote`: el carrito solo
// guarda `productId`, `quantity` y `variant`, nunca un precio (SPEC 8.2).
export default function CartPage(): ReactElement {
  const cart = useCart();
  const orderService = useMemo(
    () =>
      new StoreOrderService(
        getPublicApiBaseUrl(),
        typeof window === 'undefined' ? undefined : window.location.hostname,
      ),
    [],
  );

  const itemsKey = JSON.stringify(cart.items);
  const { data, error } = useAsyncData<QuoteResponse>(
    `store-cart-quote:${itemsKey}`,
    () =>
      cart.items.length === 0
        ? Promise.resolve(EMPTY_QUOTE)
        : orderService.quote({ items: [...cart.items] }),
  );
  const quote = data ?? EMPTY_QUOTE;

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="ui-heading text-3xl">Tu carrito está vacío</h1>
        <p className="text-muted-foreground mt-3">Todavía no agregaste productos.</p>
        <Button asChild className="mt-6">
          <Link href="/tienda">Ir a la tienda</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="ui-heading mb-8 text-3xl md:text-4xl">Tu carrito</h1>
      {error !== null && <p className="text-destructive mb-4 text-sm">{error}</p>}

      <div className="grid gap-10 md:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <ul className="flex flex-col gap-4">
            {cart.items.map((item) => {
              const line = quote.lines.find(
                (candidate) =>
                  candidate.productId === item.productId &&
                  variantsMatch(candidate.variant, item.variant),
              );
              const variantEntries = Object.entries(item.variant);

              return (
                <li
                  key={`${item.productId}-${JSON.stringify(item.variant)}`}
                  className="ui-card flex flex-wrap items-center gap-4 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {line?.name ?? `Producto #${item.productId}`}
                    </p>
                    {variantEntries.length > 0 && (
                      <p className="text-muted-foreground text-sm">
                        {variantEntries
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(', ')}
                      </p>
                    )}
                    {line !== undefined && (
                      <p className="text-sm">{formatClp(line.unitPriceCents)} c/u</p>
                    )}
                  </div>
                  <Input
                    type="number"
                    min={1}
                    aria-label={`Cantidad de ${line?.name ?? 'producto'}`}
                    value={item.quantity}
                    onChange={(event) =>
                      cart.setQuantity(
                        item.productId,
                        item.variant,
                        Math.max(1, Number(event.target.value) || 1),
                      )
                    }
                    className="w-20"
                  />
                  <p className="w-24 text-right font-medium">
                    {line !== undefined ? formatClp(line.totalCents) : '…'}
                  </p>
                  <button
                    type="button"
                    aria-label="Quitar del carrito"
                    onClick={() => cart.remove(item.productId, item.variant)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </li>
              );
            })}
          </ul>
          <Button variant="ghost" onClick={() => cart.clear()} className="self-start">
            Vaciar carrito
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <OrderSummary quote={quote} />
          <Button asChild size="lg">
            <Link href="/tienda/comprar">Continuar a comprar</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
