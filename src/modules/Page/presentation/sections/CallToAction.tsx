import Link from 'next/link';
import type { ReactElement } from 'react';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import {
  SectionBackgroundPropsSchema,
  sectionBackgroundStyle,
  sectionSurfaceAttributes,
} from '@/shared/lib/sectionBackground';
import { SectionLayoutPropsSchema, sectionLayoutClasses } from '@/shared/lib/sectionLayout';
import { RevealOnScroll } from '@/shared/ui/RevealOnScroll';
import type { SectionComponentProps } from '../SectionComponentProps';

const CallToActionPropsSchema = z.object({
  title: z.string().default(''),
  subtitle: z.string().optional(),
  buttonLabel: z.string().optional(),
  buttonHref: z.string().optional(),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  /** Color CSS del texto; sin él, blanco automático sobre imagen de fondo. */
  textColor: z.string().optional(),
});

export function CallToAction({
  sectionProps,
}: SectionComponentProps): ReactElement | null {
  const parsed = CallToActionPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, subtitle, buttonLabel, buttonHref, backgroundImageUrl, textColor } =
    parsed.data;
  const hasBackgroundImage = backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(parsed.data, {
    paddingY: 'compact',
    contentWidth: 'medium',
    textAlign: 'center',
  });

  return (
    <section
      className={cn('bg-primary text-primary-foreground', layout.section)}
      style={{
        ...sectionBackgroundStyle(parsed.data),
        // Va sobre el velo oscuro de la imagen de fondo, no sobre el fondo del tema.
        color: textColor ?? (hasBackgroundImage ? '#ffffff' : undefined),
      }}
      {...sectionSurfaceAttributes(parsed.data)}
    >
      <RevealOnScroll
        animation={parsed.data.animation}
        className={cn(layout.container, 'flex flex-col items-center gap-4')}
      >
        <h2 className="ui-heading text-3xl md:text-4xl">{title}</h2>
        {subtitle !== undefined && (
          <p
            className={
              textColor === undefined
                ? 'text-primary-foreground/80 max-w-xl'
                : 'max-w-xl opacity-80'
            }
          >
            {subtitle}
          </p>
        )}
        {buttonLabel !== undefined && buttonHref !== undefined && (
          <Button asChild variant="secondary" size="lg" className="mt-2">
            <Link href={buttonHref}>{buttonLabel}</Link>
          </Button>
        )}
      </RevealOnScroll>
    </section>
  );
}
