import type { CartItem, CartVariant } from '../domain/Cart';

// Dos variantes son la "misma línea" del carrito cuando tienen las mismas claves con los
// mismos valores: un mismo producto en dos tallas distintas son líneas distintas.
export const variantsMatch = (a: CartVariant, b: CartVariant): boolean => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) {
    return false;
  }
  return aKeys.every((key) => a[key] === b[key]);
};

const findIndex = (
  items: readonly CartItem[],
  productId: number,
  variant: CartVariant,
): number =>
  items.findIndex(
    (item) => item.productId === productId && variantsMatch(item.variant, variant),
  );

// Agregar una línea ya presente (mismo producto, misma variante) suma la cantidad en vez de
// duplicar la línea; una variante distinta del mismo producto es una línea aparte.
export const addCartItem = (
  items: readonly CartItem[],
  addition: CartItem,
): CartItem[] => {
  const index = findIndex(items, addition.productId, addition.variant);
  if (index === -1) {
    return [...items, addition];
  }
  return items.map((item, itemIndex) =>
    itemIndex === index ? { ...item, quantity: item.quantity + addition.quantity } : item,
  );
};

// Cantidad 0 o menor quita la línea, igual que el botón "Quitar".
export const setCartItemQuantity = (
  items: readonly CartItem[],
  productId: number,
  variant: CartVariant,
  quantity: number,
): CartItem[] => {
  if (quantity <= 0) {
    return removeCartItem(items, productId, variant);
  }
  const index = findIndex(items, productId, variant);
  if (index === -1) {
    return [...items];
  }
  return items.map((item, itemIndex) =>
    itemIndex === index ? { ...item, quantity } : item,
  );
};

export const removeCartItem = (
  items: readonly CartItem[],
  productId: number,
  variant: CartVariant,
): CartItem[] =>
  items.filter(
    (item) => !(item.productId === productId && variantsMatch(item.variant, variant)),
  );

export const cartItemCount = (items: readonly CartItem[]): number =>
  items.reduce((total, item) => total + item.quantity, 0);
