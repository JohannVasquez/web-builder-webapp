import { z } from 'zod';

// Resumen de publicación: lo que trae el listado y cada entrada de `related`.
export const BlogPostSummarySchema = z.object({
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  coverImageUrl: z.string().nullable(),
  // La misma portada como clave; la URL firmada caduca y no sirve para `next/image`.
  coverImageKey: z.string().nullable().optional(),
  authorName: z.string(),
  publishedAt: z.string(),
  tags: z.array(z.string()),
  readingMinutes: z.number(),
});

export type BlogPostSummary = z.infer<typeof BlogPostSummarySchema>;

// Bloques de contenido, cada uno validado por su propia forma. El detalle de la publicación
// no exige que TODO el arreglo cumpla un tipo conocido (eso lo decide el renderer, que ignora
// en silencio lo que no reconoce): aquí solo se pide que cada bloque sea un objeto con `type`.
export const BlogParagraphBlockSchema = z.object({
  type: z.literal('paragraph'),
  text: z.string(),
});

export const BlogHeadingBlockSchema = z.object({
  type: z.literal('heading'),
  level: z.union([z.literal(2), z.literal(3)]),
  text: z.string(),
});

export const BlogListBlockSchema = z.object({
  type: z.literal('list'),
  ordered: z.boolean(),
  items: z.array(z.string()),
});

export const BlogQuoteBlockSchema = z.object({
  type: z.literal('quote'),
  text: z.string(),
  cite: z.string().optional(),
});

// `key` ya llega resuelto a una URL absoluta desde la API; el nombre se mantiene por ser el
// que usa el contrato, no porque haya que resolverlo en el frontend.
export const BlogImageBlockSchema = z.object({
  type: z.literal('image'),
  key: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
});

export const BlogVideoBlockSchema = z.object({
  type: z.literal('video'),
  url: z.string(),
  caption: z.string().optional(),
});

export const BlogDividerBlockSchema = z.object({ type: z.literal('divider') });

// Forma mínima para validar la respuesta sin reventar ante un tipo de bloque nuevo que el
// frontend todavía no conoce: `BlogContent` es quien decide, bloque por bloque, cuáles sabe
// dibujar e ignora en silencio el resto.
export const BlogContentBlockSchema = z.object({ type: z.string() }).passthrough();

export type BlogContentBlock = z.infer<typeof BlogContentBlockSchema>;

export const BlogPostDetailSchema = BlogPostSummarySchema.extend({
  content: z.array(BlogContentBlockSchema).default([]),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  ogImageUrl: z.string().nullable(),
  related: z.array(BlogPostSummarySchema).default([]),
});

export type BlogPostDetail = z.infer<typeof BlogPostDetailSchema>;

export const BlogListResponseSchema = z.object({
  posts: z.array(BlogPostSummarySchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
});

export type BlogListResponse = z.infer<typeof BlogListResponseSchema>;

export const BlogPostResponseSchema = z.object({ post: BlogPostDetailSchema });
