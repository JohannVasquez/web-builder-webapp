import type { Metadata } from 'next';

// Las rutas transaccionales (carrito, pago, agradecimiento) y el contenido que el cliente
// marcó como no indexable.
export const NO_INDEX: Metadata['robots'] = { index: false, follow: false };

// `noindex` llega opcional desde la API: ausente significa que el contenido se indexa, que es
// el estado normal. Solo el `true` explícito lo saca del índice.
export const robotsFor = (
  noindex: boolean | undefined,
): Metadata['robots'] | undefined => (noindex === true ? NO_INDEX : undefined);
