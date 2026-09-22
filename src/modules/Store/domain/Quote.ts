import { z } from 'zod';
import { CartVariantSchema } from './Cart';
import { ShippingOptionSchema } from './StoreSettings';

// Lo que viaja en el cuerpo de `POST /api/store/quote` y `/checkout`: nunca un precio, la
// API es quien cotiza a partir del `productId`, la cantidad y la variante elegida.
export const QuoteItemInputSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  variant: CartVariantSchema.optional(),
});

export type QuoteItemInput = z.infer<typeof QuoteItemInputSchema>;

export const QuoteRequestSchema = z.object({
  items: z.array(QuoteItemInputSchema),
  couponCode: z.string().optional(),
  shippingCode: z.string().optional(),
});

export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;

export const QuoteLineSchema = z.object({
  productId: z.string(),
  name: z.string(),
  variant: CartVariantSchema,
  unitPriceCents: z.number(),
  quantity: z.number(),
  totalCents: z.number(),
});

export type QuoteLine = z.infer<typeof QuoteLineSchema>;

export const QuoteTotalsSchema = z.object({
  subtotalCents: z.number(),
  discountCents: z.number(),
  shippingCents: z.number(),
  totalCents: z.number(),
  taxCents: z.number(),
});

export type QuoteTotals = z.infer<typeof QuoteTotalsSchema>;

export const AppliedCouponSchema = z.object({
  code: z.string(),
  discountCents: z.number(),
});

export type AppliedCoupon = z.infer<typeof AppliedCouponSchema>;

export const QuoteResponseSchema = z.object({
  lines: z.array(QuoteLineSchema),
  totals: QuoteTotalsSchema,
  currency: z.string(),
  coupon: AppliedCouponSchema.nullable(),
  // Mensaje pensado para quien compra: se muestra tal cual, sin bloquear la compra.
  couponRejection: z.string().nullable(),
  shipping: ShippingOptionSchema.nullable(),
  availableShipping: z.array(ShippingOptionSchema),
  taxIncluded: z.boolean(),
  taxRatePercent: z.number(),
  // Página de términos que hay que aceptar para comprar; nula si la tienda no los exige.
  termsPageSlug: z.string().nullable().default(null),
});

export type QuoteResponse = z.infer<typeof QuoteResponseSchema>;

// Cuerpo de un error de negocio (400): el mensaje ya está escrito para quien compra.
export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
});
