import Link from 'next/link';
import type { ReactElement } from 'react';
import { z } from 'zod';
import { Button } from '@/shared/ui/button';
import type { SectionComponentProps } from '../SectionComponentProps';

const CallToActionPropsSchema = z.object({
  title: z.string().default(''),
  subtitle: z.string().optional(),
  buttonLabel: z.string().optional(),
  buttonHref: z.string().optional(),
});

export function CallToAction({
  sectionProps,
}: SectionComponentProps): ReactElement | null {
  const parsed = CallToActionPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, subtitle, buttonLabel, buttonHref } = parsed.data;

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 py-16 text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
        {subtitle !== undefined && (
          <p className="text-primary-foreground/80 max-w-xl">{subtitle}</p>
        )}
        {buttonLabel !== undefined && buttonHref !== undefined && (
          <Button asChild variant="secondary" size="lg" className="mt-2">
            <Link href={buttonHref}>{buttonLabel}</Link>
          </Button>
        )}
      </div>
    </section>
  );
}
