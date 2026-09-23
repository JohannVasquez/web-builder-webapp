'use client';

import { useState, type ReactElement } from 'react';
import { MessageCircle, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/shared/ui/button';
import type { CartVariant } from '../domain/Cart';
import type { ProductView } from '../domain/Product';
import { useCart } from './CartProvider';

interface AddToCartFormProps {
  readonly product: ProductView;
}

const defaultVariant = (product: ProductView): CartVariant => {
  const variant: Record<string, string> = {};
  for (const group of product.variants) {
    const firstOption = group.options[0];
    if (firstOption !== undefined) {
      variant[group.name] = firstOption;
    }
  }
  return variant;
};

// Selector de variantes, cantidad y las dos formas de comprar (SPEC 8.2). Un producto agotado
// no se puede agregar; el botón de WhatsApp solo aparece si la API dio una URL para él.
export function AddToCartForm({ product }: AddToCartFormProps): ReactElement {
  const cart = useCart();
  const [variant, setVariant] = useState<CartVariant>(() => defaultVariant(product));
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = (): void => {
    cart.add({ productId: product.id, quantity, variant });
    toast.success('Agregado al carrito.');
  };

  return (
    <div className="flex flex-col gap-4">
      {product.variants.map((group) => (
        <div key={group.name} className="flex flex-col gap-2">
          <label htmlFor={`variant-${group.name}`} className="text-sm font-medium">
            {group.name}
          </label>
          <select
            id={`variant-${group.name}`}
            className="ui-input h-9 px-3 text-sm"
            value={variant[group.name] ?? ''}
            onChange={(event) =>
              setVariant((current) => ({ ...current, [group.name]: event.target.value }))
            }
          >
            {group.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <label htmlFor="quantity" className="text-sm font-medium">
          Cantidad
        </label>
        <input
          id="quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))}
          className="ui-input h-9 w-24 px-3 text-sm"
          disabled={product.isSoldOut}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleAddToCart} disabled={product.isSoldOut} size="lg">
          <ShoppingCart /> {product.isSoldOut ? 'Agotado' : 'Agregar al carrito'}
        </Button>
        {product.whatsappOrderUrl !== null && (
          <Button asChild variant="outline" size="lg">
            <a href={product.whatsappOrderUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle /> Pedir por WhatsApp
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
