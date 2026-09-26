import { z } from 'zod';

export const RedirectSchema = z.object({
  id: z.string(),
  fromPath: z.string(),
  toPath: z.string(),
  statusCode: z.number(),
  createdAt: z.string(),
});

export type Redirect = z.infer<typeof RedirectSchema>;
