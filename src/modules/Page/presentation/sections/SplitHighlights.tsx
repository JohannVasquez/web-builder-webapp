import type { ReactElement } from 'react';
import { z } from 'zod';
import {
  BadgeCheck,
  Clock,
  Factory,
  Gauge,
  Globe,
  Home,
  Layers,
  LayoutTemplate,
  Lightbulb,
  PlugZap,
  Shield,
  ShoppingCart,
  Sparkles,
  Sun,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  SectionBackgroundPropsSchema,
  sectionBackgroundStyle,
} from '@/shared/lib/sectionBackground';
import type { SectionComponentProps } from '../SectionComponentProps';

const SplitHighlightsPropsSchema = z.object({
  /** Línea corta sobre el título (ej. "¿Por qué elegirnos?"). */
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  ...SectionBackgroundPropsSchema.shape,
  accentColor: z.string().optional(),
  /**
   * Foto que acompaña la lista (a un costado), no confundir con
   * `backgroundImageUrl` (esa cubre la sección entera). Sin ella, solo se
   * muestra la lista.
   */
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  imagePosition: z.enum(['left', 'right']).default('left'),
  items: z
    .array(
      z.object({
        icon: z.string().optional(),
        title: z.string(),
        description: z.string(),
      }),
    )
    .default([]),
});

const ICONS: Readonly<Record<string, LucideIcon>> = {
  zap: Zap,
  layers: Layers,
  shield: Shield,
  layout: LayoutTemplate,
  globe: Globe,
  'shopping-cart': ShoppingCart,
  'badge-check': BadgeCheck,
  clock: Clock,
  factory: Factory,
  gauge: Gauge,
  home: Home,
  lightbulb: Lightbulb,
  'plug-zap': PlugZap,
  sun: Sun,
  wrench: Wrench,
};

export function SplitHighlights({
  sectionProps,
}: SectionComponentProps): ReactElement | null {
  const parsed = SplitHighlightsPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { eyebrow, title, items, accentColor, imageUrl, imageAlt, imagePosition } =
    parsed.data;
  const hasImage = imageUrl !== undefined;
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;

  const content = (
    <div>
      {eyebrow !== undefined && (
        <p
          className={cn(
            'mb-2 text-sm font-semibold tracking-wide uppercase',
            hasBackgroundImage && accentColor === undefined && 'text-white/80',
          )}
          style={accentColor !== undefined ? { color: accentColor } : undefined}
        >
          {eyebrow}
        </p>
      )}
      {title !== '' && (
        <h2
          className={cn(
            'ui-heading relative inline-block pb-3 text-3xl md:text-4xl',
            hasBackgroundImage && 'text-white',
          )}
        >
          {title}
          <span
            className="absolute bottom-0 left-0 h-1 w-16 rounded-full"
            style={{ backgroundColor: accentColor ?? 'var(--brand-accent)' }}
          />
        </h2>
      )}
      <ul className="mt-8 space-y-6">
        {items.map((item) => {
          const Icon = (item.icon !== undefined && ICONS[item.icon]) || Sparkles;
          return (
            <li key={item.title} className="flex gap-4">
              <div
                className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-full"
                style={
                  accentColor !== undefined
                    ? {
                        backgroundColor: `color-mix(in srgb, ${accentColor} 14%, transparent)`,
                        color: accentColor,
                      }
                    : undefined
                }
              >
                <Icon className="size-5" />
              </div>
              <div>
                <h3 className={cn('font-semibold', hasBackgroundImage && 'text-white')}>
                  {item.title}
                </h3>
                <p
                  className={cn(
                    'mt-1 text-sm leading-relaxed',
                    hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground',
                  )}
                >
                  {item.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <section style={sectionBackgroundStyle(parsed.data)}>
      <div
        className={cn(
          'mx-auto max-w-6xl px-6 py-20',
          hasImage ? 'grid items-center gap-12 md:grid-cols-2' : 'max-w-3xl',
        )}
      >
        {hasImage && (
          // eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image
          <img
            src={imageUrl}
            alt={imageAlt ?? ''}
            className={cn(
              'aspect-4/3 w-full rounded-2xl object-cover shadow-sm',
              imagePosition === 'right' && 'md:order-2',
            )}
          />
        )}
        {content}
      </div>
    </section>
  );
}
