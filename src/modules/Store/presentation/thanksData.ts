import { OrderSchema, type CheckoutResponse, type Order } from '../domain/Checkout';
import { z } from 'zod';

export interface ThanksData {
  readonly order: Order;
  readonly instructions: string | null;
}

const ThanksPayloadSchema = z.object({
  order: OrderSchema,
  instructions: z.string().nullable(),
});

// La página de gracias no debe romperse si se entra directo, sin haber comprado: sin `raw`
// (o con un valor que no calza con lo que manda `/tienda/comprar`) devuelve `null` en vez de
// lanzar, y la página cae al estado genérico. `raw` ya llega decodificado: Next decodifica los
// `searchParams` antes de entregarlos, y volver a hacerlo rompería con un `%` literal (ej. en
// una nota de despacho).
export const parseThanksData = (raw: string | undefined): ThanksData | null => {
  if (raw === undefined) {
    return null;
  }
  try {
    const parsed = ThanksPayloadSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const THANKS_PATH = '/tienda/gracias';

export type AfterCheckout =
  | { readonly kind: 'external'; readonly url: string }
  | { readonly kind: 'thanks'; readonly path: string };

// A dónde ir después de comprar. Un medio de pago externo (Flow) se lleva a quien compra a su
// sitio y vuelve a `/tienda/gracias` sin el detalle. Pero si la API devuelve como destino
// nuestra propia página de gracias —el pago simulado de una demo de prospecto, que ya viene
// pagado—, ir ahí a secas mostraría "no encontramos el pedido, revisa tu correo" en una demo
// que nunca manda correos: se va con el detalle del pedido que ya tenemos en la mano.
export const afterCheckout = (
  response: CheckoutResponse,
  currentOrigin: string,
): AfterCheckout => {
  if (
    response.redirectUrl !== null &&
    !isOwnThanksPage(response.redirectUrl, currentOrigin)
  ) {
    return { kind: 'external', url: response.redirectUrl };
  }
  const payload = encodeURIComponent(
    JSON.stringify({ order: response.order, instructions: response.instructions }),
  );
  return { kind: 'thanks', path: `${THANKS_PATH}?data=${payload}` };
};

const isOwnThanksPage = (url: string, currentOrigin: string): boolean => {
  try {
    const target = new URL(url, currentOrigin);
    return target.origin === currentOrigin && target.pathname === THANKS_PATH;
  } catch {
    return false;
  }
};
