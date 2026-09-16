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
  sectionSurfaceAttributes,
} from '@/shared/lib/sectionBackground';
import {
  SectionLayoutPropsSchema,
  sectionLayoutClasses,
  type SectionLayoutDefaults,
} from '@/shared/lib/sectionLayout';
import { imageLoading } from '@/shared/lib/imageLoading';
import { RevealOnScroll } from '@/shared/ui/RevealOnScroll';
import type { SectionComponentProps } from '../SectionComponentProps';

const FEATURES_VARIANTS = ['card', 'plain', 'list', 'bento'] as const;

const FEATURES_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof FEATURES_VARIANTS)[number], SectionLayoutDefaults>
> = {
  card: { paddingY: 'normal', contentWidth: 'normal', textAlign: 'left' },
  plain: { paddingY: 'normal', contentWidth: 'normal', textAlign: 'left' },
  list: { paddingY: 'normal', contentWidth: 'narrow', textAlign: 'left' },
  bento: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'left' },
};

const FeaturesPropsSchema = z.object({
  // Línea corta sobre el título (ej. "Sectores que atendemos").
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  // Color CSS de los íconos y su burbuja.
  accentColor: z.string().optional(),
  // `card` (default), `plain` (sin tarjeta), `list` (una columna, ícono a la izquierda) o `bento` (grilla con el primer item ocupando dos columnas).
  variant: z.enum(FEATURES_VARIANTS).default('card').catch('card'),
  items: z
    .array(
      z.object({
        icon: z.string().optional(),
        imageUrl: z.string().optional(),
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

export function Features({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = FeaturesPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { eyebrow, title, items, accentColor, variant } = parsed.data;
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(parsed.data, FEATURES_LAYOUT_DEFAULTS[variant]);

  const header = (
    <>
      {eyebrow !== undefined && (
        <p
          className={cn(
            'mb-2 text-center text-sm font-semibold tracking-wide uppercase',
            hasBackgroundImage && accentColor === undefined && 'text-white/80',
          )}
          style={accentColor !== undefined ? { color: accentColor } : undefined}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cn(
          'ui-heading mb-12 text-center text-3xl md:text-4xl',
          hasBackgroundImage && 'text-white',
        )}
      >
        {title}
      </h2>
    </>
  );

  if (variant === 'list') {
    return (
      <section
        className={layout.section}
        style={sectionBackgroundStyle(parsed.data)}
        data-variant={variant}
        {...sectionSurfaceAttributes(parsed.data)}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          {header}
          <div className="flex flex-col gap-6">
            {items.map((item) => {
              const Icon = (item.icon !== undefined && ICONS[item.icon]) || Sparkles;
              return (
                <div key={item.title} className="flex items-start gap-4 text-left">
                  {item.imageUrl !== undefined ? (
                    // eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="size-16 shrink-0 rounded-lg object-cover"
                      {...imageLoading()}
                    />
                  ) : (
                    <div
                      className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-full"
                      style={
                        accentColor !== undefined
                          ? {
                              backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                              color: accentColor,
                            }
                          : undefined
                      }
                    >
                      <Icon className="size-6" />
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <h3
                      className={cn(
                        'text-xl font-semibold',
                        hasBackgroundImage && 'text-white',
                      )}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={cn(
                        'text-sm',
                        hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground',
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </RevealOnScroll>
      </section>
    );
  }

  if (variant === 'bento') {
    return (
      <section
        className={layout.section}
        style={sectionBackgroundStyle(parsed.data)}
        data-variant={variant}
        {...sectionSurfaceAttributes(parsed.data)}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          {header}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => {
              const Icon = (item.icon !== undefined && ICONS[item.icon]) || Sparkles;
              return (
                <div
                  key={item.title}
                  className={cn(
                    'ui-card flex flex-col gap-3 rounded-3xl p-6 text-left',
                    index === 0 && 'sm:col-span-2',
                  )}
                >
                  {item.imageUrl !== undefined ? (
                    // eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-32 w-full rounded-2xl object-cover"
                      {...imageLoading()}
                    />
                  ) : (
                    <div
                      className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full"
                      style={
                        accentColor !== undefined
                          ? {
                              backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                              color: accentColor,
                            }
                          : undefined
                      }
                    >
                      <Icon className="size-6" />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              );
            })}
          </div>
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
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item) => {
            const Icon = (item.icon !== undefined && ICONS[item.icon]) || Sparkles;
            return (
              <div
                key={item.title}
                className={cn(
                  'flex flex-col items-center gap-4 text-center',
                  variant === 'card' && 'ui-card p-8',
                )}
              >
                {item.imageUrl !== undefined ? (
                  // eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-32 w-full rounded-lg object-cover"
                    {...imageLoading()}
                  />
                ) : (
                  <div
                    className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full"
                    style={
                      accentColor !== undefined
                        ? {
                            backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
                            color: accentColor,
                          }
                        : undefined
                    }
                  >
                    <Icon className="size-6" />
                  </div>
                )}
                <h3
                  className={cn(
                    'text-xl font-semibold',
                    variant === 'plain' && hasBackgroundImage && 'text-white',
                  )}
                >
                  {item.title}
                </h3>
                <p
                  className={cn(
                    'text-sm',
                    variant === 'plain' && hasBackgroundImage
                      ? 'text-white/80'
                      : 'text-muted-foreground',
                  )}
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </RevealOnScroll>
    </section>
  );
}
