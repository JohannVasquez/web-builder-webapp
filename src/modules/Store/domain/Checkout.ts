import { z } from 'zod';
import { QuoteItemInputSchema, QuoteLineSchema } from './Quote';

export const CustomerInputSchema = z.object({
  name: z.string().min(1, 'Cuéntanos tu nombre'),
  email: z.email('Escribe un correo válido'),
  phone: z.string().min(1, 'Déjanos un teléfono de contacto'),
});

export type CustomerInput = z.infer<typeof CustomerInputSchema>;

export const DELIVERY_METHODS = ['shipping', 'pickup'] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

export const DeliveryInputSchema = z.object({
  method: z.enum(DELIVERY_METHODS),
  addressLine: z.string().optional(),
  addressCity: z.string().optional(),
  addressRegion: z.string().optional(),
  addressNotes: z.string().optional(),
});

export type DeliveryInput = z.infer<typeof DeliveryInputSchema>;

export const CheckoutRequestSchema = z.object({
  items: z.array(QuoteItemInputSchema),
  couponCode: z.string().optional(),
  shippingCode: z.string().optional(),
  customer: CustomerInputSchema,
  delivery: DeliveryInputSchema,
  returnUrl: z.string().optional(),
  acceptedTerms: z.boolean().optional(),
});

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

export const OrderDeliverySchema = z.object({
  method: z.enum(DELIVERY_METHODS),
  shippingName: z.string().nullable(),
  addressLine: z.string().nullable(),
  addressCity: z.string().nullable(),
  addressRegion: z.string().nullable(),
  addressNotes: z.string().nullable(),
});

export const OrderSchema = z.object({
  id: z.number(),
  number: z.string(),
  status: z.string(),
  statusLabel: z.string(),
  customer: CustomerInputSchema,
  delivery: OrderDeliverySchema,
  items: z.array(QuoteLineSchema),
  subtotalCents: z.number(),
  discountCents: z.number(),
  shippingCents: z.number(),
  taxCents: z.number(),
  totalCents: z.number(),
  currency: z.string(),
  couponCode: z.string().nullable(),
  paymentProvider: z.string(),
  paidAt: z.string().nullable(),
  createdAt: z.string(),
});

export type Order = z.infer<typeof OrderSchema>;

export const CheckoutResponseSchema = z.object({
  order: OrderSchema,
  redirectUrl: z.string().nullable(),
  instructions: z.string().nullable(),
});

export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;
