import { CartSchema, type Cart } from '../domain/Cart';

const STORAGE_KEY = 'web-builder.store-cart';

const EMPTY_CART: Cart = { items: [] };

// Todo acceso va en try/catch: en modo privado, con las cookies bloqueadas o durante el
// renderizado en servidor, `localStorage` puede no existir o lanzar (mismo criterio que
// `Auth/infrastructure/sessionStorage.ts`). Sin almacenamiento disponible, el carrito
// simplemente vive en memoria durante esa pestaña.
export const readCart = (): Cart => {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (raw === null || raw === undefined) {
      return EMPTY_CART;
    }
    const parsed = CartSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : EMPTY_CART;
  } catch {
    return EMPTY_CART;
  }
};

export const writeCart = (cart: Cart): void => {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Carrito solo en memoria durante esta pestaña: preferible a romper la compra.
  }
};
