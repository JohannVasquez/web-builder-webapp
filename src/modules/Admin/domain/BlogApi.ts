import { z } from 'zod';

export const blogParagraphSchema = z.object({
  type: z.literal('paragraph'),
  text: z.string(),
});

export const blogHeadingSchema = z.object({
  type: z.literal('heading'),
  text: z.string(),
  level: z.number(),
});

export const blogQuoteSchema = z.object({
  type: z.literal('quote'),
  text: z.string(),
});

export const blogListSchema = z.object({
  type: z.literal('list'),
  items: z.array(z.string()),
});

export const blogImageSchema = z.object({
  type: z.literal('image'),
  key: z.string(),
  alt: z.string(),
});

export const blogVideoSchema = z.object({
  type: z.literal('video'),
  url: z.string(),
  caption: z.string(),
});

export const blogDividerSchema = z.object({
  type: z.literal('divider'),
});

export const blogBlockSchema = z.discriminatedUnion('type', [
  blogParagraphSchema,
  blogHeadingSchema,
  blogQuoteSchema,
  blogListSchema,
  blogImageSchema,
  blogVideoSchema,
  blogDividerSchema,
]);

export type BlogBlock = z.infer<typeof blogBlockSchema>;

export const blogPostSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string().nullable(),
  coverImageKey: z.string().nullable(),
  content: z.array(blogBlockSchema),
  authorName: z.string(),
  status: z.enum(['draft', 'published', 'scheduled']),
  publishedAt: z.string().nullable(),
  tags: z.array(z.string()),
  seoTitle: z.string().nullable(),
  seoDescription: z.string().nullable(),
  ogImageKey: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BlogPost = z.infer<typeof blogPostSchema>;

export const blogPostListResponseSchema = z.object({
  posts: z.array(blogPostSchema),
});

export const blogPostResponseSchema = z.object({
  post: blogPostSchema,
});
