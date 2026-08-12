import Link from 'next/link';
import type { ReactElement } from 'react';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import type { SectionComponentProps } from '../SectionComponentProps';

const HeroPropsSchema = z.object({
  title: z.string().default(''),
  subtitle: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
});

export function Hero({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = HeroPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, subtitle, ctaLabel, ctaHref } = parsed.data;

  return (
    <section className="bg-gradient-to-b from-secondary to-background">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-24 text-center md:py-32">
        <h1 className="text-4xl font-bold tracking-tight text-balance md:text-6xl">
          {title}
        </h1>
        {subtitle !== undefined && (
          <p className="text-muted-foreground max-w-2xl text-lg text-pretty md:text-xl">
            {subtitle}
          </p>
        )}
        {ctaLabel !== undefined && ctaHref !== undefined && (
          <Button asChild size="lg" className="mt-2">
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        )}
      </div>
    </section>
  );
}
