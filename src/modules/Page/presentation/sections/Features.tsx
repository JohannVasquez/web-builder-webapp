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
import type { SectionComponentProps } from '../SectionComponentProps';

const FeaturesPropsSchema = z.object({
  /** Línea corta sobre el título (ej. "Sectores que atendemos"). */
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  /** Color CSS de fondo de toda la sección (viene de la BD). */
  backgroundColor: z.string().optional(),
  /** Color CSS de los íconos y su burbuja. */
  accentColor: z.string().optional(),
  /**
   * `card` (default): cada item en una tarjeta con borde y sombra.
   * `plain`: solo ícono + título + descripción, sin tarjeta — para bandas
   * de resumen como "sectores que atendemos", más livianas que una grilla
   * de servicios.
   */
  variant: z.enum(['card', 'plain']).default('card'),
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
  const { eyebrow, title, items, backgroundColor, accentColor, variant } = parsed.data;

  return (
    <section style={backgroundColor !== undefined ? { backgroundColor } : undefined}>
      <div className="mx-auto max-w-5xl px-6 py-20">
        {eyebrow !== undefined && (
          <p
            className="mb-2 text-center text-sm font-semibold tracking-wide uppercase"
            style={accentColor !== undefined ? { color: accentColor } : undefined}
          >
            {eyebrow}
          </p>
        )}
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {items.map((item) => {
            const Icon = (item.icon !== undefined && ICONS[item.icon]) || Sparkles;
            return (
              <div
                key={item.title}
                className={cn(
                  'flex flex-col items-center gap-4 text-center',
                  variant === 'card' && 'bg-card rounded-xl border p-8 shadow-sm',
                )}
              >
                {item.imageUrl !== undefined ? (
                  // eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-32 w-full rounded-lg object-cover"
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
      </div>
    </section>
  );
}
