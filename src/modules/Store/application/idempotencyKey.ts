export type KeyForPurchase = (purchase: unknown) => string;

// La clave queda atada al contenido de la compra: un doble clic o un reintento de red mandan
// exactamente lo mismo y reusan la clave (la API devuelve el mismo pedido), pero si la persona
// corrige el formulario tras un error, es otra compra y recibe una clave nueva. Reusar la
// vieja con otro contenido haría que la API la rechace con 422.
export const createIdempotencyKeyTracker = (generate: () => string): KeyForPurchase => {
  let current: { fingerprint: string; key: string } | null = null;
  return (purchase: unknown): string => {
    const fingerprint = JSON.stringify(purchase);
    if (current === null || current.fingerprint !== fingerprint) {
      current = { fingerprint, key: generate() };
    }
    return current.key;
  };
};
