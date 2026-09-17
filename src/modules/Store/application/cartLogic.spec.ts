import {
  addCartItem,
  cartItemCount,
  removeCartItem,
  setCartItemQuantity,
  variantsMatch,
} from './cartLogic';
import type { CartItem } from '../domain/Cart';

const item = (overrides: Partial<CartItem> = {}): CartItem => ({
  productId: 1,
  quantity: 1,
  variant: {},
  ...overrides,
});

describe('variantsMatch', () => {
  it('es true para dos variantes vacías', () => {
    expect(variantsMatch({}, {})).toBe(true);
  });

  it('es true para las mismas claves y valores', () => {
    expect(variantsMatch({ Tamaño: '12 porciones' }, { Tamaño: '12 porciones' })).toBe(
      true,
    );
  });

  it('es false cuando el valor difiere', () => {
    expect(variantsMatch({ Tamaño: '12 porciones' }, { Tamaño: '20 porciones' })).toBe(
      false,
    );
  });

  it('es false cuando difiere la cantidad de atributos', () => {
    expect(
      variantsMatch(
        { Tamaño: '12 porciones' },
        { Tamaño: '12 porciones', Color: 'Rojo' },
      ),
    ).toBe(false);
  });
});

describe('addCartItem', () => {
  it('agrega una línea nueva a un carrito vacío', () => {
    const result = addCartItem([], item({ quantity: 2 }));
    expect(result).toEqual([item({ quantity: 2 })]);
  });

  it('suma la cantidad cuando el producto y la variante coinciden', () => {
    const cart = [item({ quantity: 2, variant: { Tamaño: '12 porciones' } })];
    const result = addCartItem(
      cart,
      item({ quantity: 3, variant: { Tamaño: '12 porciones' } }),
    );
    expect(result).toEqual([item({ quantity: 5, variant: { Tamaño: '12 porciones' } })]);
  });

  it('agrega una línea aparte cuando la variante es distinta', () => {
    const cart = [item({ quantity: 1, variant: { Tamaño: '12 porciones' } })];
    const result = addCartItem(
      cart,
      item({ quantity: 1, variant: { Tamaño: '20 porciones' } }),
    );
    expect(result).toHaveLength(2);
  });

  it('no muta el arreglo original', () => {
    const cart = [item()];
    addCartItem(cart, item({ quantity: 5 }));
    expect(cart).toEqual([item()]);
  });
});

describe('setCartItemQuantity', () => {
  it('actualiza la cantidad de la línea que coincide', () => {
    const cart = [item({ quantity: 1 })];
    const result = setCartItemQuantity(cart, 1, {}, 4);
    expect(result).toEqual([item({ quantity: 4 })]);
  });

  it('quita la línea cuando la cantidad es 0', () => {
    const cart = [item({ quantity: 1 })];
    const result = setCartItemQuantity(cart, 1, {}, 0);
    expect(result).toEqual([]);
  });

  it('no toca otras líneas del carrito', () => {
    const cart = [
      item({ productId: 1, quantity: 1 }),
      item({ productId: 2, quantity: 1 }),
    ];
    const result = setCartItemQuantity(cart, 1, {}, 9);
    expect(result).toEqual([
      item({ productId: 1, quantity: 9 }),
      item({ productId: 2, quantity: 1 }),
    ]);
  });
});

describe('removeCartItem', () => {
  it('quita solo la línea con el mismo producto y variante', () => {
    const cart = [
      item({ productId: 1, variant: { Tamaño: '12 porciones' } }),
      item({ productId: 1, variant: { Tamaño: '20 porciones' } }),
    ];
    const result = removeCartItem(cart, 1, { Tamaño: '12 porciones' });
    expect(result).toEqual([item({ productId: 1, variant: { Tamaño: '20 porciones' } })]);
  });

  it('deja el carrito igual si no encuentra la línea', () => {
    const cart = [item({ productId: 1 })];
    const result = removeCartItem(cart, 2, {});
    expect(result).toEqual(cart);
  });
});

describe('cartItemCount', () => {
  it('es 0 para un carrito vacío', () => {
    expect(cartItemCount([])).toBe(0);
  });

  it('suma las cantidades de todas las líneas', () => {
    const cart = [item({ quantity: 2 }), item({ productId: 2, quantity: 3 })];
    expect(cartItemCount(cart)).toBe(5);
  });
});
