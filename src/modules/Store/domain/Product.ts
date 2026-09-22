import { z } from 'zod';

// Un producto con variantes trae, por cada atributo, el nombre y las opciones disponibles
// (ej. {name: 'Tamaño', options: ['12 porciones', '20 porciones']}).
export const ProductVariantGroupSchema = z.object({
  name: z.string(),
  options: z.array(z.string()),
});

export type ProductVariantGroup = z.infer<typeof ProductVariantGroupSchema>;

// `price`/`salePrice` ya vienen formateados por la API ("$29.990"): nunca se reformatean acá.
// `price` es el monto a pagar hoy; cuando `hasDiscount` es true, `salePrice` es el monto
// anterior, para mostrarlo tachado junto al de ahora.
export const ProductViewSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  imageUrls: z.array(z.string()),
  priceCents: z.number(),
  salePriceCents: z.number().nullable(),
  currency: z.string(),
  price: z.string(),
  salePrice: z.string().nullable(),
  hasDiscount: z.boolean(),
  variants: z.array(ProductVariantGroupSchema),
  categoryId: z.string().nullable(),
  stock: z.number().nullable(),
  isSoldOut: z.boolean(),
  whatsappOrderUrl: z.string().nullable(),
});

export type ProductView = z.infer<typeof ProductViewSchema>;

export const ProductListResponseSchema = z.object({
  products: z.array(ProductViewSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
});

export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;

export const FeaturedProductsResponseSchema = z.object({
  products: z.array(ProductViewSchema),
});

export const ProductResponseSchema = z.object({ product: ProductViewSchema });

export const ProductCategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  position: z.number(),
});

export type ProductCategory = z.infer<typeof ProductCategorySchema>;

export const ProductCategoriesResponseSchema = z.object({
  categories: z.array(ProductCategorySchema),
});
