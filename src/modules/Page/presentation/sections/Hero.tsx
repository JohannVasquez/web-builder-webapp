import Link from 'next/link';
import type { ReactElement } from 'react';
import { z } from 'zod';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
import type { SectionComponentProps } from '../SectionComponentProps';

const HeroPropsSchema = z.object({
  title: z.string().default(''),
  subtitle: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  /** URL absoluta (bucket del módulo FileStorage) usada como fondo. */
  imageUrl: z.string().optional(),
  /** Color CSS del velo sobre la imagen, para asegurar contraste del texto. */
  overlayColor: z.string().optional(),
  textColor: z.string().optional(),
});

const DEFAULT_OVERLAY = 'rgba(23, 16, 76, 0.55)';

export function Hero({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = HeroPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, subtitle, ctaLabel, ctaHref, imageUrl, overlayColor, textColor } =
    parsed.data;

  const hasImage = imageUrl !== undefined;
  const overlay = overlayColor ?? DEFAULT_OVERLAY;

  return (
    <section
      className={cn(
        hasImage ? 'bg-cover bg-center' : 'bg-gradient-to-b from-secondary to-background',
      )}
      style={
        hasImage
          ? {
              backgroundImage: `linear-gradient(${overlay}, ${overlay}), url(${imageUrl})`,
            }
          : undefined
      }
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center md:py-32">
        <h1
          className={cn(
            'text-4xl font-bold tracking-tight text-balance md:text-6xl',
            hasImage && 'text-white',
          )}
          style={textColor !== undefined ? { color: textColor } : undefined}
        >
          {title}
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
        {ctaLabel !== undefined && ctaHref !== undefined && (
          <Button
            asChild
            size="lg"
            className="mt-2"
            variant={hasImage ? 'secondary' : 'default'}
          >
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        )}
      </div>
    </section>
  );
}
