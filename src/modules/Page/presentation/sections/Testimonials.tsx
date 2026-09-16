'use client';

import { useState, type ReactElement } from 'react';
import { z } from 'zod';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
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
import type { SectionComponentProps } from '../SectionComponentProps';

const TESTIMONIALS_VARIANTS = ['carousel', 'grid', 'featured', 'masonry'] as const;

const TESTIMONIALS_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof TESTIMONIALS_VARIANTS)[number], SectionLayoutDefaults>
> = {
  carousel: { paddingY: 'normal', contentWidth: 'narrow', textAlign: 'left' },
  grid: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'left' },
  featured: { paddingY: 'spacious', contentWidth: 'medium', textAlign: 'center' },
  masonry: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'left' },
};

const TestimonialsPropsSchema = z.object({
  title: z.string().default(''),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  accentColor: z.string().optional(),
  // `carousel` (default, uno a la vez), `grid` (todos en una grilla), `featured` (solo el primero, grande) o `masonry` (muro de columnas).
  variant: z.enum(TESTIMONIALS_VARIANTS).default('carousel').catch('carousel'),
  items: z
    .array(
      z.object({
        // Etiqueta corta sobre la cita (ej. el nombre del proyecto).
        badgeLabel: z.string().optional(),
        quote: z.string(),
        rating: z.number().int().min(1).max(5).default(5),
        authorName: z.string(),
        authorLocation: z.string().optional(),
      }),
    )
    .default([]),
});

type TestimonialItem = z.infer<typeof TestimonialsPropsSchema>['items'][number];

export function Testimonials({
  sectionProps,
}: SectionComponentProps): ReactElement | null {
  const parsed = TestimonialsPropsSchema.safeParse(sectionProps);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!parsed.success) {
    return null;
  }
  const { title, items, accentColor, variant } = parsed.data;
  if (items.length === 0) {
    return null;
  }

  const current = items[activeIndex % items.length];
  const accent = accentColor ?? 'var(--brand-accent)';
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const goTo = (delta: number): void => {
    setActiveIndex((index) => (index + delta + items.length) % items.length);
  };
  const layout = sectionLayoutClasses(parsed.data, TESTIMONIALS_LAYOUT_DEFAULTS[variant]);

  const header = title !== '' && (
    <h2
      className={cn(
        'ui-heading relative mx-auto mb-14 inline-block w-full pb-3 text-center text-3xl md:text-4xl',
        hasBackgroundImage && 'text-white',
      )}
    >
      {title}
      <span
        className="absolute bottom-0 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full"
        style={{ backgroundColor: accent }}
      />
    </h2>
  );

  const renderStars = (rating: number, size: string): ReactElement => (
    <div className="flex gap-0.5" aria-label={`${rating} de 5 estrellas`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(size, index < rating ? 'fill-current' : 'fill-none opacity-30')}
          style={{ color: accent }}
        />
      ))}
    </div>
  );

  const renderCard = (item: TestimonialItem): ReactElement => (
    <div key={item.authorName} className="ui-card flex flex-col gap-4 break-inside-avoid p-6">
      {item.badgeLabel !== undefined && (
        <span
          className="w-fit rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase"
          style={{
            backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
            color: accent,
          }}
        >
          {item.badgeLabel}
        </span>
      )}
      {renderStars(item.rating, 'size-4')}
      <p className="text-sm leading-relaxed text-pretty">&ldquo;{item.quote}&rdquo;</p>
      <div className="mt-auto flex items-center gap-3">
        <div
          className="flex size-9 items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: accent }}
          aria-hidden="true"
        >
          {item.authorName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold">{item.authorName}</p>
          {item.authorLocation !== undefined && (
            <p className="text-muted-foreground text-xs">{item.authorLocation}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (variant === 'grid') {
    return (
      <section
        className={layout.section}
        style={sectionBackgroundStyle(parsed.data)}
        data-variant={variant}
        {...sectionSurfaceAttributes(parsed.data)}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          {header}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => renderCard(item))}
          </div>
        </RevealOnScroll>
      </section>
    );
  }

  if (variant === 'masonry') {
    return (
      <section
        className={layout.section}
        style={sectionBackgroundStyle(parsed.data)}
        data-variant={variant}
        {...sectionSurfaceAttributes(parsed.data)}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          {header}
          <div className="columns-1 gap-6 md:columns-2 lg:columns-3 [&>*]:mb-6">
            {items.map((item) => renderCard(item))}
          </div>
        </RevealOnScroll>
      </section>
    );
  }

  if (variant === 'featured') {
    const featured = items[0];
    return (
      <section
        className={layout.section}
        style={sectionBackgroundStyle(parsed.data)}
        data-variant={variant}
        {...sectionSurfaceAttributes(parsed.data)}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          {header}
          <div className="ui-card mx-auto flex max-w-2xl flex-col items-center gap-4 p-10 text-center md:p-14">
            {featured.badgeLabel !== undefined && (
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase"
                style={{
                  backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
                  color: accent,
                }}
              >
                {featured.badgeLabel}
              </span>
            )}
            {renderStars(featured.rating, 'size-5')}
            <p className="text-2xl leading-relaxed text-pretty">
              &ldquo;{featured.quote}&rdquo;
            </p>
            <div className="mt-2 flex flex-col items-center gap-1">
              <p className="text-sm font-semibold">{featured.authorName}</p>
              {featured.authorLocation !== undefined && (
                <p className="text-muted-foreground text-xs">{featured.authorLocation}</p>
              )}
            </div>
          </div>
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
        <div className="ui-card relative p-8 md:p-10">
          {current.badgeLabel !== undefined && (
            <span
              className="mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase"
              style={{
                backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
                color: accent,
              }}
            >
              {current.badgeLabel}
            </span>
          )}
          <div
            className="mb-4 flex gap-0.5"
            aria-label={`${current.rating} de 5 estrellas`}
          >
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                className={cn(
                  'size-4',
                  index < current.rating ? 'fill-current' : 'fill-none opacity-30',
                )}
                style={{ color: accent }}
              />
            ))}
          </div>
          <p className="text-lg leading-relaxed text-pretty">
            &ldquo;{current.quote}&rdquo;
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div
              className="flex size-10 items-center justify-center rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: accent }}
              aria-hidden="true"
            >
              {current.authorName.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold">{current.authorName}</p>
              {current.authorLocation !== undefined && (
                <p className="text-muted-foreground text-xs">{current.authorLocation}</p>
              )}
            </div>
          </div>

          {items.length > 1 && (
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                aria-label="Testimonio anterior"
                onClick={() => goTo(-1)}
                className="hover:bg-accent flex size-8 items-center justify-center rounded-full border transition-colors"
              >
                <ChevronLeft className="size-4" />
              </button>
              <div className="flex gap-1.5">
                {items.map((item, index) => (
                  <button
                    key={item.authorName}
                    type="button"
                    aria-label={`Ir al testimonio ${index + 1}`}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      'size-2 rounded-full transition-all',
                      index === activeIndex ? 'w-5' : 'opacity-30',
                    )}
                    style={{ backgroundColor: accent }}
                  />
                ))}
              </div>
              <button
                type="button"
                aria-label="Siguiente testimonio"
                onClick={() => goTo(1)}
                className="hover:bg-accent flex size-8 items-center justify-center rounded-full border transition-colors"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </RevealOnScroll>
    </section>
  );
}
