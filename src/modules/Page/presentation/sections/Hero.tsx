'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactElement } from 'react';
import { z } from 'zod';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import type { SectionComponentProps } from '../SectionComponentProps';

const HeroPropsSchema = z.object({
  /** Texto corto sobre el título, en una píldora (ej. "Certificados SEC Clase A"). */
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  /** Segunda línea del título, en `accentColor` (ej. "a su servicio"). */
  titleAccent: z.string().optional(),
  subtitle: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  /** Botón secundario (estilo outline), junto al principal. */
  secondaryCtaLabel: z.string().optional(),
  secondaryCtaHref: z.string().optional(),
  /** URL absoluta (bucket del módulo FileStorage) usada como fondo. */
  imageUrl: z.string().optional(),
  /**
   * Varias imágenes rotan automáticamente como fondo (con puntos indicadores
   * abajo), para el hero tipo carrusel. Si viene junto a `imageUrl`, tiene
   * prioridad; con una sola imagen se comporta igual que `imageUrl` sin
   * animarla.
   */
  images: z.array(z.string()).optional(),
  /** Color CSS del velo sobre la imagen, para asegurar contraste del texto. */
  overlayColor: z.string().optional(),
  textColor: z.string().optional(),
  accentColor: z.string().optional(),
});

const DEFAULT_OVERLAY = 'var(--brand-overlay)';
const DEFAULT_ACCENT = 'var(--brand-accent)';
const CAROUSEL_INTERVAL_MS = 5000;

export function Hero({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = HeroPropsSchema.safeParse(sectionProps);
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = parsed.success
    ? (parsed.data.images ??
      (parsed.data.imageUrl !== undefined ? [parsed.data.imageUrl] : []))
    : [];
  const isCarousel = slides.length > 1;

  useEffect(() => {
    if (!isCarousel) {
      return;
    }
    const id = setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [isCarousel, slides.length]);

  if (!parsed.success) {
    return null;
  }
  const {
    eyebrow,
    title,
    titleAccent,
    subtitle,
    ctaLabel,
    ctaHref,
    secondaryCtaLabel,
    secondaryCtaHref,
    overlayColor,
    textColor,
    accentColor,
  } = parsed.data;

  const hasImage = slides.length > 0;
  const overlay = overlayColor ?? DEFAULT_OVERLAY;
  const accent = accentColor ?? DEFAULT_ACCENT;

  return (
    <section
      className={cn(
        'relative',
        hasImage ? 'bg-cover bg-center' : 'bg-gradient-to-b from-secondary to-background',
      )}
      style={
        hasImage
          ? {
              backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${slides[activeSlide]})`,
              transition: 'background-image 700ms ease-in-out',
            }
          : undefined
      }
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center md:py-32">
        {eyebrow !== undefined && (
          <span
            className={cn(
              'rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide uppercase',
              hasImage
                ? 'border-white/30 bg-white/10 text-white backdrop-blur-sm'
                : 'border-border bg-background/60 text-muted-foreground',
            )}
          >
            {eyebrow}
          </span>
        )}
        <h1
          className={cn(
            'text-4xl font-bold tracking-tight text-balance md:text-6xl',
            hasImage && 'text-white',
          )}
          style={textColor !== undefined ? { color: textColor } : undefined}
        >
          {title}
          {titleAccent !== undefined && (
            <>
              <br />
              <span style={{ color: accent }}>{titleAccent}</span>
            </>
          )}
        </h1>
        {subtitle !== undefined && (
          <p
            className={cn(
              'max-w-2xl text-lg text-pretty md:text-xl',
              hasImage ? 'text-white/85' : 'text-muted-foreground',
            )}
            style={textColor !== undefined ? { color: textColor } : undefined}
          >
            {subtitle}
          </p>
        )}
        {(ctaLabel !== undefined || secondaryCtaLabel !== undefined) && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            {ctaLabel !== undefined && ctaHref !== undefined && (
              <Button
                asChild
                size="lg"
                variant={hasImage ? 'secondary' : 'default'}
                style={
                  hasImage
                    ? { backgroundColor: accent, color: 'var(--brand-accent-foreground)' }
                    : undefined
                }
              >
                <Link href={ctaHref}>{ctaLabel}</Link>
              </Button>
            )}
            {secondaryCtaLabel !== undefined && secondaryCtaHref !== undefined && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className={
                  hasImage
                    ? 'border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white'
                    : undefined
                }
              >
                <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
              </Button>
            )}
          </div>
        )}
      </div>
      {isCarousel && (
        <div className="absolute inset-x-0 bottom-6 flex justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide}
              type="button"
              aria-label={`Ir a la imagen ${index + 1}`}
              onClick={() => setActiveSlide(index)}
              className={cn(
                'size-2 rounded-full transition-all',
                index === activeSlide ? 'w-6 bg-white' : 'bg-white/40',
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}
