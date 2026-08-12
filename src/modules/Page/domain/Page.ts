import { z } from 'zod';

export const PageSectionSchema = z.strictObject({
  type: z.string(),
  position: z.number(),
  props: z.record(z.string(), z.unknown()),
});

export const PageSchema = z.strictObject({
  slug: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  sections: z.array(PageSectionSchema),
});

export type PageSection = z.infer<typeof PageSectionSchema>;
export type Page = z.infer<typeof PageSchema>;
