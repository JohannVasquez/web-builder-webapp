import { z } from 'zod';

// Tolerante con campos nuevos: que la API agregue un dato es un cambio compatible, y un
// esquema estricto lo convertía en un 500 en todas las páginas de todos los clientes.
export const PageSectionSchema = z.object({
  type: z.string(),
  position: z.number(),
  props: z.record(z.string(), z.unknown()),
  anchor: z.string().nullable(),
});

export const PageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  // Estilo propio de la página; nulo = hereda el del sitio. Con default, una API que todavía
  // no lo manda sigue siendo válida.
  visualStyle: z.string().nullable().default(null),
  // Metadatos de buscador propios de la página. Con default, una API que todavía no los
  // manda sigue siendo válida (ver web-builder-api#63).
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  ogImageUrl: z.string().nullable().optional(),
  noindex: z.boolean().optional(),
  sections: z.array(PageSectionSchema),
});

export type PageSection = z.infer<typeof PageSectionSchema>;
export type Page = z.infer<typeof PageSchema>;

// Resumen que alimenta el sitemap: la API ya filtra las despublicadas.
export const PublishedPageSummarySchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  updatedAt: z.string().nullable(),
  // Opcional porque las respuestas guardadas en caché desde antes de que la API lo enviara
  // siguen siendo válidas; sin el dato, la página se indexa, que es el estado normal.
  noindex: z.boolean().optional(),
});

export const PublishedPagesSchema = z.object({
  pages: z.array(PublishedPageSummarySchema),
});

export type PublishedPageSummary = z.infer<typeof PublishedPageSummarySchema>;
