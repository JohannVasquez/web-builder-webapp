import type { ReactElement } from 'react';
import { z } from 'zod';
import type { SectionComponentProps } from '../SectionComponentProps';

const TextBlockPropsSchema = z.object({
  title: z.string().optional(),
  content: z.string().default(''),
});

export function TextBlock({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = TextBlockPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, content } = parsed.data;

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      {title !== undefined && (
        <h2 className="mb-6 text-3xl font-bold tracking-tight">{title}</h2>
      )}
      <p className="text-muted-foreground leading-relaxed text-pretty">{content}</p>
    </section>
  );
}
