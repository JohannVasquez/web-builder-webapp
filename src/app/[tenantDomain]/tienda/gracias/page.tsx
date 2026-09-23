import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactElement } from 'react';
import { parseThanksData } from '@/modules/Store/presentation/thanksData';
import { formatClp } from '@/modules/Store/presentation/money';
import { Button } from '@/shared/ui/button';
import { NO_INDEX } from '@/shared/lib/seo';

interface ThanksPageProps {
  readonly searchParams: Promise<{ data?: string }>;
}

// El detalle del pedido viaja en `?data=`: esta URL no puede terminar en un buscador.
export const metadata: Metadata = { robots: NO_INDEX };

// No depende de ningún estado del navegador (carrito, sesión): todo lo que muestra viaja en
// `?data=`, puesto ahí por `/tienda/comprar` justo después de comprar. Entrar directo, sin ese
// parámetro, no rompe la página: solo cae al estado genérico de abajo.
export default async function ThanksPage({
  searchParams,
}: ThanksPageProps): Promise<ReactElement> {
  const { data } = await searchParams;
  const thanks = parseThanksData(data);

  if (thanks === null) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="ui-heading text-3xl">¡Gracias!</h1>
        <p className="text-muted-foreground mt-3">
          No encontramos el detalle de un pedido reciente. Si acabas de comprar, revisa tu
          correo para la confirmación.
        </p>
        <Button asChild className="mt-6">
          <Link href="/tienda">Volver a la tienda</Link>
        </Button>
      </div>
    );
  }

  const { order, instructions } = thanks;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="ui-heading text-3xl">¡Gracias por tu compra!</h1>
      <p className="text-muted-foreground mt-2">
        Tu número de pedido es{' '}
        <span className="text-foreground font-semibold">{order.number}</span>. Te
        escribiremos a {order.customer.email} con las novedades.
      </p>

      <div className="ui-card mt-8 flex flex-col gap-3 p-6">
        <h2 className="text-lg font-semibold">Detalle del pedido</h2>
        <ul className="flex flex-col gap-2 text-sm">
          {order.items.map((item, index) => (
            <li key={index} className="flex justify-between gap-4">
              <span>
                {item.name}
                {Object.keys(item.variant).length > 0 && (
                  <span className="text-muted-foreground">
                    {' '}
                    (
                    {Object.entries(item.variant)
                      .map(([key, value]) => `${key}: ${value}`)
                      .join(', ')}
                    )
                  </span>
                )}{' '}
                × {item.quantity}
              </span>
              <span>{formatClp(item.totalCents)}</span>
            </li>
          ))}
        </ul>
        <div className="border-border flex flex-col gap-2 border-t pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatClp(order.subtotalCents)}</span>
          </div>
          {order.discountCents > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Descuento</span>
              <span>-{formatClp(order.discountCents)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Envío</span>
            <span>
              {order.shippingCents === 0 ? 'Gratis' : formatClp(order.shippingCents)}
            </span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatClp(order.totalCents)}</span>
          </div>
        </div>
      </div>

      {instructions !== null && (
        <div className="ui-card mt-6 flex flex-col gap-2 p-6">
          <h2 className="text-lg font-semibold">Cómo pagar</h2>
          <p className="whitespace-pre-line text-sm">{instructions}</p>
        </div>
      )}

      <Button asChild className="mt-8">
        <Link href="/tienda">Seguir comprando</Link>
      </Button>
    </div>
  );
}
