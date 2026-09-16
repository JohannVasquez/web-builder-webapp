import Link from 'next/link';
import type { ReactElement } from 'react';
import { z } from 'zod';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  Factory,
  Gauge,
  Globe,
  Home,
  Layers,
  LayoutTemplate,
  Lightbulb,
  PlugZap,
  Ruler,
  Shield,
  ShoppingCart,
  Sparkles,
  Sun,
  Thermometer,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  SectionBackgroundPropsSchema,
  sectionBackgroundStyle,
  sectionSurfaceAttributes,
} from '@/shared/lib/sectionBackground';
import { SectionLayoutPropsSchema, sectionLayoutClasses } from '@/shared/lib/sectionLayout';
import { RevealOnScroll } from '@/shared/ui/RevealOnScroll';
import type { SectionComponentProps } from '../SectionComponentProps';

const ServiceCardsPropsSchema = z.object({
  title: z.string().default(''),
  subtitle: z.string().optional(),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  accentColor: z.string().optional(),
  items: z
    .array(
      z.object({
        icon: z.string().optional(),
        title: z.string(),
        description: z.string(),
        checklist: z.array(z.string()).default([]),
        linkLabel: z.string().optional(),
        linkHref: z.string().optional(),
      }),
    )
    .default([]),
  viewAllLabel: z.string().optional(),
  viewAllHref: z.string().optional(),
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
  ruler: Ruler,
  thermometer: Thermometer,
};

/**
 * Elige el número de columnas que deja filas parejas: múltiplos de 3 usan 3
 * columnas (evita una última fila de 4+2 al tener, por ejemplo, 6 cards), 1
 * y 2 usan su propio conteo, y el resto cae a 4. Clases literales (no
 * interpoladas) para que Tailwind las detecte al escanear el código.
 */
const gridColumnsClassName = (count: number): string => {
  if (count === 1) {
    return 'md:grid-cols-1';
  }
  if (count === 2) {
    return 'md:grid-cols-2';
  }
  return count % 3 === 0 ? 'md:grid-cols-3' : 'md:grid-cols-4';
};

export function ServiceCards({
  sectionProps,
}: SectionComponentProps): ReactElement | null {
  const parsed = ServiceCardsPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, subtitle, items, accentColor, viewAllLabel, viewAllHref } = parsed.data;
  const gridColumns = gridColumnsClassName(items.length);
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(parsed.data, {
    paddingY: 'normal',
    contentWidth: 'wide',
    textAlign: 'left',
  });

  return (
    <section
      className={layout.section}
      style={sectionBackgroundStyle(parsed.data)}
      {...sectionSurfaceAttributes(parsed.data)}
    >
      <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
        {(title !== '' || subtitle !== undefined) && (
          <div className="mx-auto mb-14 max-w-2xl text-center">
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
            {subtitle !== undefined && (
              <p
                className={cn(
                  'mt-3',
                  hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground',
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}
        <div className={cn('grid gap-6', gridColumns)}>
          {items.map((item) => {
            const Icon = (item.icon !== undefined && ICONS[item.icon]) || Sparkles;
            return (
              <div key={item.title} className="ui-card flex flex-col p-7">
                <div
                  className="bg-primary/10 text-primary mb-5 flex size-11 items-center justify-center rounded-full"
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
                <h3 className="text-base font-bold tracking-wide uppercase">
                  {item.title}
                </h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {item.description}
                </p>
                {item.checklist.length > 0 && (
                  <ul className="mt-5 space-y-2">
                    {item.checklist.map((line) => (
                      <li key={line} className="flex items-start gap-2 text-sm">
                        <Check
                          className="mt-0.5 size-4 shrink-0"
                          style={
                            accentColor !== undefined ? { color: accentColor } : undefined
                          }
                        />
                        <span className="text-muted-foreground">{line}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {item.linkLabel !== undefined && item.linkHref !== undefined && (
                  <Link
                    href={item.linkHref}
                    className="mt-6 flex items-center gap-1.5 text-sm font-semibold hover:underline"
                    style={accentColor !== undefined ? { color: accentColor } : undefined}
                  >
                    {item.linkLabel}
                    <ArrowRight className="size-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
        {viewAllLabel !== undefined && viewAllHref !== undefined && (
          <div className="mt-12 text-center">
            <Link
              href={viewAllHref}
              className="hover:bg-accent inline-flex items-center gap-2 rounded-md border px-6 py-2.5 text-sm font-semibold transition-colors"
              style={
                accentColor !== undefined
                  ? { borderColor: accentColor, color: accentColor }
                  : undefined
              }
            >
              {viewAllLabel}
            </Link>
          </div>
        )}
      </RevealOnScroll>
    </section>
  );
}
