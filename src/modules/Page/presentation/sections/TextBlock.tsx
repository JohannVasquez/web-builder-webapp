import Image from 'next/image';
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
import { HEADING_TAGS } from '@/shared/lib/heading';
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

export function TextBlock({
  sectionProps,
  headingLevel = 2,
}: SectionComponentProps): ReactElement | null {
  const Heading = HEADING_TAGS[headingLevel];
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
            <Heading
              className={cn(
                'ui-heading mb-6 text-3xl',
                hasBackgroundImage && 'text-white',
              )}
            >
              {title}
            </Heading>
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
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl shadow-sm"><Image src={imageUrl} alt={imageAlt ?? ''} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div>
        )}
      </RevealOnScroll>
    </section>
  );
}
