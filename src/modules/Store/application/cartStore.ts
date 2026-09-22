import type { Cart, CartItem, CartStorage, CartVariant } from '../domain/Cart';
import {
  addCartItem,
  cartItemCount,
  removeCartItem,
  setCartItemQuantity,
} from './cartLogic';

// Store externo mínimo sobre `CartStorage`, para `useSyncExternalStore`: el carrito vive en
// `localStorage`, fuera de React, y leerlo o escribirlo en un efecto rompería el patrón
// (mismo motivo que documenta `useAsyncData.ts` y `sessionStore.ts`).
export interface CartStore {
  readonly subscribe: (listener: () => void) => () => void;
  readonly getSnapshot: () => readonly CartItem[];
  readonly add: (item: CartItem) => void;
  readonly setQuantity: (
    productId: string,
    variant: CartVariant,
    quantity: number,
  ) => void;
  readonly remove: (productId: string, variant: CartVariant) => void;
  readonly clear: () => void;
}

export const createCartStore = (storage: CartStorage): CartStore => {
  const listeners = new Set<() => void>();
  let snapshot: readonly CartItem[] | undefined;

  const readItems = (): readonly CartItem[] => storage.read().items;

  const publish = (items: readonly CartItem[]): void => {
    snapshot = items;
    storage.write({ items: [...items] });
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: (): readonly CartItem[] => {
      if (snapshot === undefined) {
        snapshot = readItems();
      }
      return snapshot;
    },
    add: (item: CartItem): void => {
      publish(addCartItem(snapshot ?? readItems(), item));
    },
    setQuantity: (productId: string, variant: CartVariant, quantity: number): void => {
      publish(setCartItemQuantity(snapshot ?? readItems(), productId, variant, quantity));
    },
    remove: (productId: string, variant: CartVariant): void => {
      publish(removeCartItem(snapshot ?? readItems(), productId, variant));
    },
    clear: (): void => {
      publish([]);
    },
  };
};

export const cartCount = (cart: Cart): number => cartItemCount(cart.items);
