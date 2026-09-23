import type { Cart, CartStorage } from '../domain/Cart';
import { readCart, writeCart } from './cartBrowserStorage';

export class LocalCartStorage implements CartStorage {
  public read(): Cart {
    return readCart();
  }

  public write(cart: Cart): void {
    writeCart(cart);
  }
}
