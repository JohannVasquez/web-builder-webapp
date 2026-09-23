import { readCart, writeCart } from './cartBrowserStorage';
import { Cart } from '../domain/Cart';

describe('cartBrowserStorage', () => {
  const mockStorage = new Map<string, string>();

  beforeAll(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (k: string) => mockStorage.get(k) ?? null,
        setItem: (k: string, v: string) => mockStorage.set(k, v),
        removeItem: (k: string) => mockStorage.delete(k),
        clear: () => mockStorage.clear(),
      },
      writable: true,
    });
  });

  beforeEach(() => {
    globalThis.localStorage.clear();
  });

  it('devuelve el carrito vacío si no hay nada guardado', () => {
    expect(readCart()).toEqual({ items: [] });
  });

  it('guarda y lee un carrito válido', () => {
    const cart: Cart = {
      items: [
        { productId: '018f6f1a-0000-7000-8000-000000000001', quantity: 2, variant: {} },
      ],
    };
    writeCart(cart);
    expect(readCart()).toEqual(cart);
  });

  it('vacía el carrito si tiene IDs numéricos viejos que no cumplen el esquema', () => {
    // Simulamos un carrito viejo con productId numérico guardado en localStorage
    const oldCartJson = JSON.stringify({
      items: [{ productId: 1, quantity: 2, variant: {} }],
    });
    globalThis.localStorage.setItem('web-builder.store-cart', oldCartJson);

    // Al leerlo, no debe romper, sino ignorarlo y devolver el carrito vacío
    expect(readCart()).toEqual({ items: [] });
  });
});
