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
import {
  SectionLayoutPropsSchema,
  sectionLayoutClasses,
  type SectionLayoutDefaults,
} from '@/shared/lib/sectionLayout';
import { RevealOnScroll } from '@/shared/ui/RevealOnScroll';
import { HEADING_TAGS } from '@/shared/lib/heading';
import type { SectionComponentProps } from '../SectionComponentProps';

const CALL_TO_ACTION_VARIANTS = ['banner', 'card', 'split'] as const;

const CALL_TO_ACTION_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof CALL_TO_ACTION_VARIANTS)[number], SectionLayoutDefaults>
> = {
  banner: { paddingY: 'compact', contentWidth: 'medium', textAlign: 'center' },
  card: { paddingY: 'spacious', contentWidth: 'medium', textAlign: 'center' },
  split: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'left' },
};

const CallToActionPropsSchema = z.object({
  title: z.string().default(''),
  subtitle: z.string().optional(),
  buttonLabel: z.string().optional(),
  buttonHref: z.string().optional(),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  // Color CSS del texto; sin él, blanco automático sobre imagen de fondo.
  textColor: z.string().optional(),
  // `banner` (default, banda a todo el ancho), `card` (tarjeta centrada con aire alrededor) o `split` (texto a la izquierda, botón a la derecha).
  variant: z.enum(CALL_TO_ACTION_VARIANTS).default('banner').catch('banner'),
});

export function CallToAction({
  sectionProps,
  headingLevel = 2,
}: SectionComponentProps): ReactElement | null {
  const parsed = CallToActionPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const Heading = HEADING_TAGS[headingLevel];
  const {
    title,
    subtitle,
    buttonLabel,
    buttonHref,
    backgroundImageUrl,
    textColor,
    variant,
  } = parsed.data;
  const hasBackgroundImage = backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(
    parsed.data,
    CALL_TO_ACTION_LAYOUT_DEFAULTS[variant],
  );

  if (variant === 'card') {
    return (
      <section
        className={layout.section}
        style={sectionBackgroundStyle(parsed.data)}
        data-variant={variant}
        {...sectionSurfaceAttributes(parsed.data)}
      >
        <RevealOnScroll
          animation={parsed.data.animation}
          className={cn(layout.container, 'flex justify-center')}
        >
          <div
            className="ui-card flex w-full flex-col items-center gap-4 p-8 text-center md:p-12"
            style={textColor !== undefined ? { color: textColor } : undefined}
          >
            <Heading className="ui-heading text-3xl md:text-4xl">{title}</Heading>
            {subtitle !== undefined && (
              <p className="text-muted-foreground max-w-xl">{subtitle}</p>
            )}
            {buttonLabel !== undefined && buttonHref !== undefined && (
              <Button asChild size="lg" className="mt-2">
                <Link href={buttonHref}>{buttonLabel}</Link>
              </Button>
            )}
          </div>
        </RevealOnScroll>
      </section>
    );
  }

  if (variant === 'split') {
    return (
      <section
        className={cn('bg-primary text-primary-foreground', layout.section)}
        style={{
          ...sectionBackgroundStyle(parsed.data),
          color: textColor ?? (hasBackgroundImage ? '#ffffff' : undefined),
        }}
        data-variant={variant}
        {...sectionSurfaceAttributes(parsed.data)}
      >
        <RevealOnScroll
          animation={parsed.data.animation}
          className={cn(
            layout.container,
            'flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left',
          )}
        >
          <div className="flex flex-col gap-2">
            <Heading className="ui-heading text-3xl md:text-4xl">{title}</Heading>
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
          </div>
          {buttonLabel !== undefined && buttonHref !== undefined && (
            <Button asChild variant="secondary" size="lg" className="shrink-0">
              <Link href={buttonHref}>{buttonLabel}</Link>
            </Button>
          )}
        </RevealOnScroll>
      </section>
    );
  }

  return (
    <section
      className={cn('bg-primary text-primary-foreground', layout.section)}
      style={{
        ...sectionBackgroundStyle(parsed.data),
        color: textColor ?? (hasBackgroundImage ? '#ffffff' : undefined),
      }}
      data-variant={variant}
      {...sectionSurfaceAttributes(parsed.data)}
    >
      <RevealOnScroll
        animation={parsed.data.animation}
        className={cn(layout.container, 'flex flex-col items-center gap-4')}
      >
        <Heading className="ui-heading text-3xl md:text-4xl">{title}</Heading>
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
