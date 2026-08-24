import type { ReactElement } from 'react';
import { z } from 'zod';
import { cn } from '@/shared/lib/utils';
import type { SectionComponentProps } from '../SectionComponentProps';

const TextBlockPropsSchema = z.object({
  title: z.string().optional(),
  content: z.string().default(''),
  /** Imagen lateral opcional (URL del bucket del módulo FileStorage). */
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  backgroundColor: z.string().optional(),
});

export function TextBlock({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = TextBlockPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, content, imageUrl, imageAlt, backgroundColor } = parsed.data;
  const hasImage = imageUrl !== undefined;

  return (
    <section style={backgroundColor !== undefined ? { backgroundColor } : undefined}>
      <div
        className={cn(
          'mx-auto px-6 py-16',
          hasImage ? 'grid max-w-5xl items-center gap-10 md:grid-cols-2' : 'max-w-3xl',
        )}
      >
        <div>
          {title !== undefined && (
            <h2 className="mb-6 text-3xl font-bold tracking-tight">{title}</h2>
          )}
          <p className="text-muted-foreground leading-relaxed text-pretty">{content}</p>
        </div>
        {hasImage && (
          // eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image
          <img
            src={imageUrl}
            alt={imageAlt ?? ''}
            className="w-full rounded-xl shadow-sm"
          />
        )}
      </div>
    </section>
  );
}
