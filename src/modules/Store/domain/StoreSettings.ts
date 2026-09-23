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
/**
 * Identificación del proveedor. El Reglamento de Comercio Electrónico la exige visible: quien
 * compra tiene que saber con quién contrata para poder reclamar o exigir su boleta.
 *
 * Opcional hasta que la API la envíe (ver web-builder-api#77); sin ella, la tienda muestra
 * solo lo que tiene en vez de fingir datos que no existen.
 */
export const SellerIdentitySchema = z.object({
  legalName: z.string().nullable(),
  taxId: z.string().nullable(),
  address: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
});

export type SellerIdentity = z.infer<typeof SellerIdentitySchema>;

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
  seller: SellerIdentitySchema.optional(),
});

export type StoreSettings = z.infer<typeof StoreSettingsSchema>;

export const StoreSettingsResponseSchema = z.object({ store: StoreSettingsSchema });

// Solo lo que está cargado: una ficha a medias es mejor que una con huecos etiquetados.
export const sellerLines = (seller: SellerIdentity | undefined): string[] => {
  if (seller === undefined) {
    return [];
  }
  return [
    seller.legalName,
    seller.taxId === null || seller.taxId === '' ? null : `RUT ${seller.taxId}`,
    seller.address,
    seller.email,
    seller.phone,
  ].filter((line): line is string => line !== null && line.trim() !== '');
};
