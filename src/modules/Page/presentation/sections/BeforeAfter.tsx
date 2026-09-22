'use client';

import { useState, type ReactElement } from 'react';
import { z } from 'zod';
import { ArrowLeftRight } from 'lucide-react';
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
import { imageLoading } from '@/shared/lib/imageLoading';
import { HEADING_TAGS } from '@/shared/lib/heading';
import { RevealOnScroll } from '@/shared/ui/RevealOnScroll';
import type { SectionComponentProps } from '../SectionComponentProps';

const BEFORE_AFTER_VARIANTS = ['slider', 'sideBySide'] as const;

const BEFORE_AFTER_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof BEFORE_AFTER_VARIANTS)[number], SectionLayoutDefaults>
> = {
  slider: { paddingY: 'normal', contentWidth: 'medium', textAlign: 'center' },
  sideBySide: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'center' },
};

const BeforeAfterPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  beforeUrl: z.string().optional(),
  afterUrl: z.string().optional(),
  beforeLabel: z.string().default('Antes'),
  afterLabel: z.string().default('Después'),
  caption: z.string().optional(),
  // `slider` (default, deslizable con el teclado) o `sideBySide` (las dos imágenes una junto a la otra).
  variant: z.enum(BEFORE_AFTER_VARIANTS).default('slider').catch('slider'),
});

const SLIDER_THUMB_CLASSES = cn(
  'h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
  '[&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:appearance-none',
  '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary',
  '[&::-moz-range-thumb]:size-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0',
  '[&::-moz-range-thumb]:bg-primary',
);

export function BeforeAfter({
  sectionProps,
  headingLevel = 2,
}: SectionComponentProps): ReactElement | null {
  const Heading = HEADING_TAGS[headingLevel];
  const [value, setValue] = useState(50);
  const parsed = BeforeAfterPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const {
    eyebrow,
    title,
    beforeUrl,
    afterUrl,
    beforeLabel,
    afterLabel,
    caption,
    variant,
  } = parsed.data;
  if (beforeUrl === undefined || afterUrl === undefined) {
    return null;
  }
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(parsed.data, BEFORE_AFTER_LAYOUT_DEFAULTS[variant]);

  const header = (
    <div className="mb-8 flex flex-col items-center gap-2">
      {eyebrow !== undefined && (
        <p
          className={cn(
            'text-sm font-semibold tracking-wide uppercase',
            hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground',
          )}
        >
          {eyebrow}
        </p>
      )}
      <Heading
        className={cn(
          'ui-heading text-3xl md:text-4xl',
          hasBackgroundImage && 'text-white',
        )}
      >
        {title}
      </Heading>
    </div>
  );

  if (variant === 'sideBySide') {
    return (
      <section
        className={layout.section}
        style={sectionBackgroundStyle(parsed.data)}
        data-variant={variant}
        {...sectionSurfaceAttributes(parsed.data)}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          {header}
          <div className="grid gap-4 sm:grid-cols-2">
            <figure className="ui-card overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image */}
              <img
                src={beforeUrl}
                alt={beforeLabel}
                className="aspect-4/3 w-full object-cover"
                {...imageLoading()}
              />
              <figcaption className="text-muted-foreground p-3 text-center text-sm font-medium">
                {beforeLabel}
              </figcaption>
            </figure>
            <figure className="ui-card overflow-hidden p-0">
              {/* eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image */}
              <img
                src={afterUrl}
                alt={afterLabel}
                className="aspect-4/3 w-full object-cover"
                {...imageLoading()}
              />
              <figcaption className="text-muted-foreground p-3 text-center text-sm font-medium">
                {afterLabel}
              </figcaption>
            </figure>
          </div>
          {caption !== undefined && (
            <p className="text-muted-foreground mt-4 text-center text-sm">{caption}</p>
          )}
        </RevealOnScroll>
      </section>
    );
  }

  return (
    <section
      className={layout.section}
      style={sectionBackgroundStyle(parsed.data)}
      data-variant={variant}
      {...sectionSurfaceAttributes(parsed.data)}
    >
      <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
        {header}
        <div className="ui-card overflow-hidden p-0">
          <div className="relative aspect-4/3 w-full select-none overflow-hidden md:aspect-16/9">
            {/* eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image */}
            <img
              src={afterUrl}
              alt={afterLabel}
              className="absolute inset-0 size-full object-cover"
              {...imageLoading()}
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image */}
            <img
              src={beforeUrl}
              alt={beforeLabel}
              className="absolute inset-0 size-full object-cover"
              style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}
              {...imageLoading()}
            />
            <div
              className="bg-background pointer-events-none absolute inset-y-0 w-0.5"
              style={{ left: `${value}%` }}
              aria-hidden="true"
            />
            <div
              className="ui-card pointer-events-none absolute top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
              style={{ left: `${value}%` }}
              aria-hidden="true"
            >
              <ArrowLeftRight className="size-4" />
            </div>
            <span className="ui-card absolute top-3 left-3 px-2 py-1 text-xs font-semibold">
              {beforeLabel}
            </span>
            <span className="ui-card absolute top-3 right-3 px-2 py-1 text-xs font-semibold">
              {afterLabel}
            </span>
          </div>
          <div className="p-4">
            <input
              type="range"
              min={0}
              max={100}
              value={value}
              onChange={(event) => setValue(Number(event.target.value))}
              aria-label={`Comparar ${beforeLabel} y ${afterLabel}: desliza para revelar la imagen de "${beforeLabel}"`}
              className={SLIDER_THUMB_CLASSES}
            />
          </div>
        </div>
        {caption !== undefined && (
          <p className="text-muted-foreground mt-4 text-center text-sm">{caption}</p>
        )}
      </RevealOnScroll>
    </section>
  );
}
