import { z } from 'zod';

export const ShippingOptionSchema = z.object({
  code: z.string(),
  name: z.string(),
  priceCents: z.number(),
  estimate: z.string().nullable(),
  requiresAddress: z.boolean(),
});

export type ShippingOption = z.infer<typeof ShippingOptionSchema>;

// Forma de `GET /api/store`: existe (200) solo si el cliente encendió la tienda. Un 404 se
// trata como "no tiene tienda" (`StoreRepository.getStoreSettings` devuelve `null`).
export const StoreSettingsSchema = z.object({
  isEnabled: z.boolean(),
  currency: z.string(),
  taxIncluded: z.boolean(),
  taxRatePercent: z.number(),
  shippingOptions: z.array(ShippingOptionSchema),
  freeShippingThresholdCents: z.number().nullable(),
  paymentProvider: z.string(),
  notificationEmail: z.string().nullable(),
  hasPaymentCredentials: z.boolean(),
});

export type StoreSettings = z.infer<typeof StoreSettingsSchema>;

export const StoreSettingsResponseSchema = z.object({ store: StoreSettingsSchema });
