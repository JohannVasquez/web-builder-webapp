import type { ReactElement } from 'react';
import { z } from 'zod';
import { cn } from '@/shared/lib/utils';
import {
  SectionBackgroundPropsSchema,
  sectionBackgroundStyle,
  sectionSurfaceAttributes,
} from '@/shared/lib/sectionBackground';
import {
  SectionLayoutPropsSchema,
  sectionLayoutClasses,
} from '@/shared/lib/sectionLayout';
import { imageLoading } from '@/shared/lib/imageLoading';
import { RevealOnScroll } from '@/shared/ui/RevealOnScroll';
import type { SectionComponentProps } from '../SectionComponentProps';

const TextBlockPropsSchema = z.object({
  title: z.string().optional(),
  content: z.string().default(''),
  /** Imagen lateral opcional (URL del bucket del módulo FileStorage). */
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
});

export function TextBlock({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = TextBlockPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, content, imageUrl, imageAlt } = parsed.data;
  const hasImage = imageUrl !== undefined;
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(parsed.data, {
    paddingY: 'compact',
    contentWidth: hasImage ? 'normal' : 'narrow',
    textAlign: 'left',
  });

  return (
    <section
      className={layout.section}
      style={sectionBackgroundStyle(parsed.data)}
      {...sectionSurfaceAttributes(parsed.data)}
    >
      <RevealOnScroll
        animation={parsed.data.animation}
        className={cn(
          layout.container,
          hasImage && 'grid items-center gap-10 md:grid-cols-2',
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
            {...imageLoading()}
          />
        )}
      </RevealOnScroll>
    </section>
  );
}
