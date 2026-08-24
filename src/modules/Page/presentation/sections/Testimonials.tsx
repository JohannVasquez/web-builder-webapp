'use client';

import { useState, type ReactElement } from 'react';
import { z } from 'zod';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { SectionComponentProps } from '../SectionComponentProps';

const TestimonialsPropsSchema = z.object({
  title: z.string().default(''),
  backgroundColor: z.string().optional(),
  accentColor: z.string().optional(),
  items: z
    .array(
      z.object({
        /** Etiqueta corta sobre la cita (ej. el nombre del proyecto). */
        badgeLabel: z.string().optional(),
        quote: z.string(),
        rating: z.number().int().min(1).max(5).default(5),
        authorName: z.string(),
        authorLocation: z.string().optional(),
      }),
    )
    .default([]),
});

export function Testimonials({
  sectionProps,
}: SectionComponentProps): ReactElement | null {
  const parsed = TestimonialsPropsSchema.safeParse(sectionProps);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!parsed.success) {
    return null;
  }
  const { title, items, backgroundColor, accentColor } = parsed.data;
  if (items.length === 0) {
    return null;
  }

  const current = items[activeIndex % items.length];
  const accent = accentColor ?? '#fbbf24';
  const goTo = (delta: number): void => {
    setActiveIndex((index) => (index + delta + items.length) % items.length);
  };

  return (
    <section style={backgroundColor !== undefined ? { backgroundColor } : undefined}>
      <div className="mx-auto max-w-3xl px-6 py-20">
        {title !== '' && (
          <h2 className="relative mx-auto mb-14 inline-block w-full pb-3 text-center text-3xl font-bold tracking-tight md:text-4xl">
            {title}
            <span
              className="absolute bottom-0 left-1/2 h-1 w-16 -translate-x-1/2 rounded-full"
              style={{ backgroundColor: accent }}
            />
          </h2>
        )}
        <div className="bg-card relative rounded-2xl border p-8 shadow-sm md:p-10">
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
      </div>
    </section>
  );
}
