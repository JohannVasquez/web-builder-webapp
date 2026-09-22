import { z } from 'zod';

export const ProductVariantSchema = z.object({
  name: z.string(),
  options: z.array(z.string()),
});

export type ProductVariant = z.infer<typeof ProductVariantSchema>;

export const ProductSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  imageKeys: z.array(z.string()),
  priceCents: z.number(),
  salePriceCents: z.number().nullable(),
  currency: z.string(),
  categoryId: z.number().nullable(),
  variants: z.array(ProductVariantSchema),
  isActive: z.boolean(),
  featured: z.boolean(),
  position: z.number(),
  stock: z.number().nullable(),
  isSoldOut: z.boolean(),
});

export type Product = z.infer<typeof ProductSchema>;

export const ProductListResponseSchema = z.object({
  products: z.array(ProductSchema),
});

export const ProductCategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export type ProductCategory = z.infer<typeof ProductCategorySchema>;

export const ProductCategoryListResponseSchema = z.object({
  categories: z.array(ProductCategorySchema),
});

export const ShippingOptionSchema = z.object({
  code: z.string(),
  name: z.string(),
  priceCents: z.number(),
  estimate: z.string(),
  requiresAddress: z.boolean(),
});

export type ShippingOption = z.infer<typeof ShippingOptionSchema>;

export const StoreSettingsSchema = z.object({
  isEnabled: z.boolean(),
  currency: z.string(),
  taxIncluded: z.boolean(),
  taxRatePercent: z.number(),
  shippingOptions: z.array(ShippingOptionSchema),
  freeShippingThresholdCents: z.number().nullable(),
  paymentProvider: z.enum(['none', 'transfer', 'flow']),
  notificationEmail: z.string().nullable(),
  hasPaymentCredentials: z.boolean(),
});

export type StoreSettings = z.infer<typeof StoreSettingsSchema>;

export const StoreSettingsResponseSchema = z.object({
  store: StoreSettingsSchema,
});

export const OrderItemSchema = z.object({
  productId: z.number().nullable(),
  name: z.string(),
  variant: z.record(z.string(), z.string()),
  unitPriceCents: z.number(),
  quantity: z.number(),
  totalCents: z.number(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderStatusSchema = z.enum([
  'pending',
  'paid',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderSchema = z.object({
  id: z.number(),
  number: z.string(),
  status: OrderStatusSchema,
  statusLabel: z.string(),
  customer: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
  }),
  delivery: z.object({
    method: z.string(),
    shippingName: z.string().nullable(),
    addressLine: z.string().nullable(),
    addressCity: z.string().nullable(),
    addressRegion: z.string().nullable(),
    addressNotes: z.string().nullable(),
  }),
  items: z.array(OrderItemSchema),
  subtotalCents: z.number(),
  discountCents: z.number(),
  shippingCents: z.number(),
  taxCents: z.number(),
  totalCents: z.number(),
  currency: z.string(),
  couponCode: z.string().nullable(),
  paymentProvider: z.string().nullable(),
  paidAt: z.string().nullable(),
  createdAt: z.string(),
});

export type Order = z.infer<typeof OrderSchema>;

export const OrderListResponseSchema = z.object({
  orders: z.array(OrderSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
});

export const OrderResponseSchema = z.object({
  order: OrderSchema,
});

export const CouponSchema = z.object({
  id: z.number(),
  code: z.string(),
  discountType: z.enum(['percentage', 'amount']),
  value: z.number(),
  minimumCents: z.number().nullable(),
  startsAt: z.string().nullable(),
  endsAt: z.string().nullable(),
  maxUses: z.number().nullable(),
  usedCount: z.number(),
  isActive: z.boolean(),
});

export type Coupon = z.infer<typeof CouponSchema>;

export const CouponListResponseSchema = z.object({
  coupons: z.array(CouponSchema),
});

export const ReportByDaySchema = z.object({
  date: z.string(),
  orders: z.number(),
  totalCents: z.number(),
});

export const ReportTopProductSchema = z.object({
  productId: z.number().nullable(),
  name: z.string(),
  units: z.number(),
  totalCents: z.number(),
});

export const StoreReportSchema = z.object({
  orders: z.number(),
  totalCents: z.number(),
  averageCents: z.number(),
  byDay: z.array(ReportByDaySchema),
  topProducts: z.array(ReportTopProductSchema),
});

export type StoreReport = z.infer<typeof StoreReportSchema>;

export const StoreReportResponseSchema = z.object({
  report: StoreReportSchema,
});

// Toda escritura de la API devuelve la entidad envuelta (`{ product }`, `{ category }`,
// `{ coupon }`), nunca suelta. Parsearla suelta hace que el guardado funcione en el servidor
// pero la pantalla lo muestre como un error.
export const ProductResponseSchema = z.object({ product: ProductSchema });
export const ProductCategoryResponseSchema = z.object({
  category: ProductCategorySchema,
});
export const CouponResponseSchema = z.object({ coupon: CouponSchema });
