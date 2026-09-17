import { z } from 'zod';

// El carrito solo guarda lo mínimo para volver a pedir la cotización: nunca un precio. Los
// precios que se muestran al pagar los manda siempre `POST /api/store/quote`.
export const CartVariantSchema = z.record(z.string(), z.string());

export type CartVariant = z.infer<typeof CartVariantSchema>;

export const CartItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().int().positive(),
  variant: CartVariantSchema,
});

export type CartItem = z.infer<typeof CartItemSchema>;

export const CartSchema = z.object({
  items: z.array(CartItemSchema),
});

export type Cart = z.infer<typeof CartSchema>;

// Puerto de persistencia del carrito: la implementación (`localStorage`) vive en
// infrastructure y se inyecta desde `src/app/**`, así presentation no la importa directo.
export interface CartStorage {
  read(): Cart;
  write(cart: Cart): void;
}
