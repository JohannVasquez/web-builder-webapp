import type { ReactElement } from 'react';
import { z } from 'zod';
import { cn } from '@/shared/lib/utils';
import {
  SectionBackgroundPropsSchema,
  sectionBackgroundStyle,
} from '@/shared/lib/sectionBackground';
import type { SectionComponentProps } from '../SectionComponentProps';

const TextBlockPropsSchema = z.object({
  title: z.string().optional(),
  content: z.string().default(''),
  /** Imagen lateral opcional (URL del bucket del módulo FileStorage). */
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  ...SectionBackgroundPropsSchema.shape,
});

export function TextBlock({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = TextBlockPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, content, imageUrl, imageAlt } = parsed.data;
  const hasImage = imageUrl !== undefined;
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;

  return (
    <section style={sectionBackgroundStyle(parsed.data)}>
      <div
        className={cn(
          'mx-auto px-6 py-16',
          hasImage ? 'grid max-w-5xl items-center gap-10 md:grid-cols-2' : 'max-w-3xl',
        )}
      >
        <div>
          {title !== undefined && (
            <h2
              className={cn(
                'ui-heading mb-6 text-3xl',
                hasBackgroundImage && 'text-white',
              )}
            >
              {title}
            </h2>
          )}
          <p
            className={cn(
              'leading-relaxed text-pretty',
              hasBackgroundImage ? 'text-white/85' : 'text-muted-foreground',
            )}
          >
            {content}
          </p>
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
