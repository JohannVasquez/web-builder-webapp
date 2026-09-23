'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import type { ReactElement } from 'react';
import { useOptionalCart } from './CartProvider';

// Vive en la navegación del sitio (SPEC 8.2). Si no hay `<CartProvider>` montado (un sitio
// sin tienda, o la guía de estilos) no rompe: simplemente no se dibuja.
export function CartIndicator(): ReactElement | null {
  const cart = useOptionalCart();
  if (cart === null) {
    return null;
  }

  return (
    <Link
      href="/tienda/carrito"
      aria-label={`Carrito, ${cart.count} ${cart.count === 1 ? 'producto' : 'productos'}`}
      className="text-muted-foreground hover:text-foreground hover:bg-accent relative rounded-md p-2 transition-colors"
    >
      <ShoppingBag className="size-5" />
      {cart.count > 0 && (
        <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
          {cart.count > 9 ? '9+' : cart.count}
        </span>
      )}
    </Link>
  );
}
