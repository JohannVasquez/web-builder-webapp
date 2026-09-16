'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactElement } from 'react';
import { z } from 'zod';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import {
  SectionLayoutPropsSchema,
  sectionLayoutClasses,
  type SectionLayoutDefaults,
} from '@/shared/lib/sectionLayout';
import { RevealOnScroll } from '@/shared/ui/RevealOnScroll';
import { ContactForm } from '@/modules/Contact/presentation/ContactForm';
import type { SectionComponentProps } from '../SectionComponentProps';

const HERO_VARIANTS = ['centered', 'split', 'minimal', 'form'] as const;

const HERO_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof HERO_VARIANTS)[number], SectionLayoutDefaults>
> = {
  centered: { paddingY: 'spacious', contentWidth: 'normal', textAlign: 'center' },
  split: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'left' },
  minimal: { paddingY: 'spacious', contentWidth: 'narrow', textAlign: 'center' },
  form: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'left' },
};

const HeroPropsSchema = z.object({
  // Texto corto sobre el título, en una píldora (ej. "Certificados SEC Clase A").
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  // Segunda línea del título, en `accentColor` (ej. "a su servicio").
  titleAccent: z.string().optional(),
  subtitle: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  // Botón secundario (estilo outline), junto al principal.
  secondaryCtaLabel: z.string().optional(),
  secondaryCtaHref: z.string().optional(),
  // URL absoluta (bucket del módulo FileStorage) usada como fondo.
  imageUrl: z.string().optional(),
  // Varias imágenes rotan automáticamente como fondo del hero `centered` (puntos indicadores abajo); con una sola se comporta igual que `imageUrl`.
  images: z.array(z.string()).optional(),
  // Color CSS del velo sobre la imagen, para asegurar contraste del texto.
  overlayColor: z.string().optional(),
  textColor: z.string().optional(),
  accentColor: z.string().optional(),
  // `centered` (default): título y botones centrados, imagen de fondo si hay. `split`: texto a un lado, primera imagen al otro. `minimal`: solo título, subtítulo y botones. `form`: texto a la izquierda y formulario de contacto a la derecha.
  variant: z.enum(HERO_VARIANTS).default('centered').catch('centered'),
  ...SectionLayoutPropsSchema.shape,
});

const DEFAULT_OVERLAY = 'var(--brand-overlay)';
const DEFAULT_ACCENT = 'var(--brand-accent)';
// Sobre imagen el título va sobre el velo oscuro; sin imagen, sobre el fondo del tema.
const DEFAULT_ACCENT_TEXT = 'var(--brand-accent-text)';
const CAROUSEL_INTERVAL_MS = 5000;

export function Hero({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = HeroPropsSchema.safeParse(sectionProps);
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = parsed.success
    ? (parsed.data.images ??
      (parsed.data.imageUrl !== undefined ? [parsed.data.imageUrl] : []))
    : [];
  const variant = parsed.success ? parsed.data.variant : 'centered';
  const isCarousel = variant === 'centered' && slides.length > 1;

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
  const accentText = accentColor ?? DEFAULT_ACCENT_TEXT;
  const { section, container } = sectionLayoutClasses(
    parsed.data,
    HERO_LAYOUT_DEFAULTS[variant],
  );

  if (variant === 'split') {
    return (
      <section className={section} data-variant={variant}>
        <RevealOnScroll
          animation={parsed.data.animation}
          className={cn(container, 'grid items-center gap-10 md:grid-cols-2')}
        >
          <div className="flex flex-col gap-6">
            {eyebrow !== undefined && (
              <span className="border-border bg-background/60 text-muted-foreground w-fit rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
                {eyebrow}
              </span>
            )}
            <h1
              className="text-4xl font-bold tracking-tight text-balance md:text-5xl"
              style={textColor !== undefined ? { color: textColor } : undefined}
            >
              {title}
              {titleAccent !== undefined && (
                <>
                  <br />
                  <span style={{ color: accentText }}>{titleAccent}</span>
                </>
              )}
            </h1>
            {subtitle !== undefined && (
              <p
                className="text-muted-foreground max-w-xl text-lg text-pretty md:text-xl"
                style={textColor !== undefined ? { color: textColor } : undefined}
              >
                {subtitle}
              </p>
            )}
            {(ctaLabel !== undefined || secondaryCtaLabel !== undefined) && (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {ctaLabel !== undefined && ctaHref !== undefined && (
                  <Button asChild size="lg">
                    <Link href={ctaHref}>{ctaLabel}</Link>
                  </Button>
                )}
                {secondaryCtaLabel !== undefined && secondaryCtaHref !== undefined && (
                  <Button asChild size="lg" variant="outline">
                    <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
          {hasImage && (
            // eslint-disable-next-line @next/next/no-img-element -- URL dinámica del bucket, fuera del optimizador de next/image
            <img
              src={slides[0]}
              alt=""
              className="aspect-4/3 w-full rounded-2xl object-cover md:order-2"
            />
          )}
        </RevealOnScroll>
      </section>
    );
  }

  if (variant === 'minimal') {
    return (
      <section className={section} data-variant={variant}>
        <RevealOnScroll
          animation={parsed.data.animation}
          className={cn(container, 'flex flex-col items-center gap-8')}
        >
          <h1
            className="text-5xl font-bold tracking-tight text-balance md:text-7xl"
            style={textColor !== undefined ? { color: textColor } : undefined}
          >
            {title}
            {titleAccent !== undefined && (
              <>
                <br />
                <span style={{ color: accentText }}>{titleAccent}</span>
              </>
            )}
          </h1>
          {subtitle !== undefined && (
            <p
              className="text-muted-foreground max-w-2xl text-lg text-pretty md:text-xl"
              style={textColor !== undefined ? { color: textColor } : undefined}
            >
              {subtitle}
            </p>
          )}
          {(ctaLabel !== undefined || secondaryCtaLabel !== undefined) && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {ctaLabel !== undefined && ctaHref !== undefined && (
                <Button asChild size="lg">
                  <Link href={ctaHref}>{ctaLabel}</Link>
                </Button>
              )}
              {secondaryCtaLabel !== undefined && secondaryCtaHref !== undefined && (
                <Button asChild size="lg" variant="outline">
                  <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
                </Button>
              )}
            </div>
          )}
        </RevealOnScroll>
      </section>
    );
  }

  if (variant === 'form') {
    return (
      <section className={section} data-variant={variant}>
        <RevealOnScroll
          animation={parsed.data.animation}
          className={cn(container, 'grid items-center gap-10 md:grid-cols-2')}
        >
          <div className="flex flex-col gap-6">
            {eyebrow !== undefined && (
              <span className="border-border bg-background/60 text-muted-foreground w-fit rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
                {eyebrow}
              </span>
            )}
            <h1
              className="text-4xl font-bold tracking-tight text-balance md:text-5xl"
              style={textColor !== undefined ? { color: textColor } : undefined}
            >
              {title}
              {titleAccent !== undefined && (
                <>
                  <br />
                  <span style={{ color: accentText }}>{titleAccent}</span>
                </>
              )}
            </h1>
            {subtitle !== undefined && (
              <p
                className="text-muted-foreground max-w-xl text-lg text-pretty md:text-xl"
                style={textColor !== undefined ? { color: textColor } : undefined}
              >
                {subtitle}
              </p>
            )}
            {(ctaLabel !== undefined || secondaryCtaLabel !== undefined) && (
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {ctaLabel !== undefined && ctaHref !== undefined && (
                  <Button asChild size="lg">
                    <Link href={ctaHref}>{ctaLabel}</Link>
                  </Button>
                )}
                {secondaryCtaLabel !== undefined && secondaryCtaHref !== undefined && (
                  <Button asChild size="lg" variant="outline">
                    <Link href={secondaryCtaHref}>{secondaryCtaLabel}</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="ui-card p-6 md:p-8">
            <ContactForm />
          </div>
        </RevealOnScroll>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'relative',
        hasImage ? 'bg-cover bg-center' : 'bg-gradient-to-b from-secondary to-background',
        section,
      )}
      style={
        hasImage
          ? {
              backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${slides[activeSlide]})`,
              transition: 'background-image 700ms ease-in-out',
            }
          : undefined
      }
      data-variant={variant}
    >
      <RevealOnScroll
        animation={parsed.data.animation}
        className={cn(container, 'flex flex-col items-center gap-6')}
      >
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
              <span style={{ color: hasImage ? accent : accentText }}>{titleAccent}</span>
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
      </RevealOnScroll>
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
