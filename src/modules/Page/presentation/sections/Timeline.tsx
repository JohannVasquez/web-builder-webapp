import type { ReactElement } from 'react';
import { z } from 'zod';
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

const TIMELINE_VARIANTS = ['vertical', 'horizontal'] as const;

const TIMELINE_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof TIMELINE_VARIANTS)[number], SectionLayoutDefaults>
> = {
  vertical: { paddingY: 'normal', contentWidth: 'narrow', textAlign: 'left' },
  horizontal: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'left' },
};

const TimelinePropsSchema = z.object({
  // Línea corta sobre el título (ej. "Cómo trabajamos").
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  accentColor: z.string().optional(),
  // `vertical` (default, una columna) u `horizontal` (una fila que se apila bajo `md`).
  variant: z.enum(TIMELINE_VARIANTS).default('vertical').catch('vertical'),
  steps: z
    .array(
      z.object({
        // Etiqueta corta opcional (ej. "Fase 1"), distinta del número o la fecha.
        label: z.string().optional(),
        title: z.string(),
        description: z.string(),
        date: z.string().optional(),
      }),
    )
    .default([]),
});

type TimelineStep = z.infer<typeof TimelinePropsSchema>['steps'][number];

export function Timeline({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = TimelinePropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { eyebrow, title, steps, accentColor, variant } = parsed.data;
  if (steps.length === 0) {
    return null;
  }

  const accent = accentColor ?? 'var(--brand-accent)';
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(parsed.data, TIMELINE_LAYOUT_DEFAULTS[variant]);

  const header = (eyebrow !== undefined || title !== '') && (
    <div className="mb-12">
      {eyebrow !== undefined && (
        <p
          className={cn(
            'mb-2 text-sm font-semibold tracking-wide uppercase',
            hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground',
          )}
        >
          {eyebrow}
        </p>
      )}
      {title !== '' && (
        <h2
          className={cn(
            'ui-heading text-3xl md:text-4xl',
            hasBackgroundImage && 'text-white',
          )}
        >
          {title}
        </h2>
      )}
    </div>
  );

  const renderStep = (step: TimelineStep, index: number): ReactElement => {
    const metaLabel = step.date ?? `Paso ${index + 1}`;
    return (
      <li key={`${step.title}-${index}`} className="relative flex-1">
        <span
          aria-hidden="true"
          className="mb-3 flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white"
          style={{ backgroundColor: accent }}
        >
          {index + 1}
        </span>
        <p
          className="text-xs font-semibold tracking-wide uppercase"
          style={{ color: accent }}
        >
          {metaLabel}
        </p>
        {step.label !== undefined && (
          <p
            className={cn(
              'mt-0.5 text-xs',
              hasBackgroundImage ? 'text-white/70' : 'text-muted-foreground',
            )}
          >
            {step.label}
          </p>
        )}
        <h3
          className={cn('mt-1 text-lg font-semibold', hasBackgroundImage && 'text-white')}
        >
          {step.title}
        </h3>
        <p
          className={cn(
            'mt-1 text-sm leading-relaxed',
            hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground',
          )}
        >
          {step.description}
        </p>
      </li>
    );
  };

  if (variant === 'horizontal') {
    return (
      <section
        className={layout.section}
        style={sectionBackgroundStyle(parsed.data)}
        data-variant={variant}
        {...sectionSurfaceAttributes(parsed.data)}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          {header}
          <ol className="border-border flex flex-col gap-10 border-l pl-6 md:flex-row md:gap-8 md:border-l-0 md:border-t md:pt-8 md:pl-0">
            {steps.map((step, index) => renderStep(step, index))}
          </ol>
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
        <ol className="border-border flex flex-col gap-10 border-l pl-6">
          {steps.map((step, index) => renderStep(step, index))}
        </ol>
      </RevealOnScroll>
    </section>
  );
}
