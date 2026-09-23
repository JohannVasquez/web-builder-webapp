import { OrderSchema, type Order } from '../domain/Checkout';
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
