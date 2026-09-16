import type { ReactElement } from 'react';
import { z } from 'zod';
import { ChevronDown } from 'lucide-react';
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

const FAQ_VARIANTS = ['accordion', 'list'] as const;

const FAQ_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof FAQ_VARIANTS)[number], SectionLayoutDefaults>
> = {
  accordion: { paddingY: 'normal', contentWidth: 'narrow', textAlign: 'left' },
  list: { paddingY: 'normal', contentWidth: 'narrow', textAlign: 'left' },
};

const FaqPropsSchema = z.object({
  // Línea corta sobre el título (ej. "Preguntas frecuentes").
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  // `accordion` (default, una respuesta visible a la vez) o `list` (todas abiertas).
  variant: z.enum(FAQ_VARIANTS).default('accordion').catch('accordion'),
  items: z
    .array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    )
    .default([]),
});

// `<details>`/`<summary>` nativos: el contenido queda en el HTML aunque no haya JS, y el
// navegador da el toggle, el foco y el estado accesible gratis.
export function Faq({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = FaqPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { eyebrow, title, items, variant } = parsed.data;
  if (items.length === 0) {
    return null;
  }
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(parsed.data, FAQ_LAYOUT_DEFAULTS[variant]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section
      className={layout.section}
      style={sectionBackgroundStyle(parsed.data)}
      data-variant={variant}
      {...sectionSurfaceAttributes(parsed.data)}
    >
      <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
        {eyebrow !== undefined && (
          <p
            className={cn(
              'mb-2 text-sm font-semibold tracking-wide uppercase',
              hasBackgroundImage && 'text-white/80',
            )}
          >
            {eyebrow}
          </p>
        )}
        {title !== '' && (
          <h2
            className={cn(
              'ui-heading mb-8 text-3xl md:text-4xl',
              hasBackgroundImage && 'text-white',
            )}
          >
            {title}
          </h2>
        )}
        <div className="flex flex-col gap-4">
          {items.map((item, index) => (
            <details
              key={`${index}-${item.question}`}
              className="ui-card group p-6"
              open={variant === 'list' ? true : undefined}
            >
              <summary
                className={cn(
                  'flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden',
                  hasBackgroundImage && 'text-white',
                )}
              >
                {item.question}
                <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p
                className={cn(
                  'mt-3 text-sm',
                  hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground',
                )}
              >
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </RevealOnScroll>
      <script
        type="application/ld+json"
        // El contenido sale de `items`, ya validado por el schema de la sección.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </section>
  );
}
