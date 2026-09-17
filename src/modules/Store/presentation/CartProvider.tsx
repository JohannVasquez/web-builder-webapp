'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { CartItem, CartStorage, CartVariant } from '../domain/Cart';
import { createCartStore } from '../application/cartStore';
import { cartItemCount } from '../application/cartLogic';

export interface CartContextValue {
  readonly items: readonly CartItem[];
  readonly count: number;
  readonly add: (item: CartItem) => void;
  readonly setQuantity: (
    productId: number,
    variant: CartVariant,
    quantity: number,
  ) => void;
  readonly remove: (productId: number, variant: CartVariant) => void;
  readonly clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const emptyItems: readonly CartItem[] = [];
const serverSnapshot = (): readonly CartItem[] => emptyItems;

interface CartProviderProps {
  readonly storage: CartStorage;
  readonly children: ReactNode;
}

// Mismo patrón que `SessionProvider`: el carrito vive fuera de React (en `localStorage`), así
// que se lee con `useSyncExternalStore` y nunca con `useState` + `useEffect`.
export function CartProvider({ storage, children }: CartProviderProps): ReactElement {
  const store = useMemo(() => createCartStore(storage), [storage]);
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, serverSnapshot);

  const add = useCallback((item: CartItem): void => store.add(item), [store]);
  const setQuantity = useCallback(
    (productId: number, variant: CartVariant, quantity: number): void =>
      store.setQuantity(productId, variant, quantity),
    [store],
  );
  const remove = useCallback(
    (productId: number, variant: CartVariant): void => store.remove(productId, variant),
    [store],
  );
  const clear = useCallback((): void => store.clear(), [store]);

  const value = useMemo<CartContextValue>(
    () => ({ items, count: cartItemCount(items), add, setQuantity, remove, clear }),
    [items, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (value === null) {
    throw new Error('useCart debe usarse dentro de un <CartProvider>');
  }
  return value;
}

// Para componentes que pueden montarse fuera de la tienda (ej. un `CartIndicator` en la
// navegación de un sitio sin carrito iniciado); devuelve `null` en vez de lanzar.
export function useOptionalCart(): CartContextValue | null {
  return useContext(CartContext);
}
