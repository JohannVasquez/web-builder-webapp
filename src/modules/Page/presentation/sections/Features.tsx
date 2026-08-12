import type { ReactElement } from 'react';
import { z } from 'zod';
import {
  Globe,
  Layers,
  LayoutTemplate,
  Shield,
  ShoppingCart,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { SectionComponentProps } from '../SectionComponentProps';

const FeaturesPropsSchema = z.object({
  title: z.string().default(''),
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
};

export function Features({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = FeaturesPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, items } = parsed.data;

  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">
        {title}
      </h2>
      <div className="grid gap-8 md:grid-cols-3">
        {items.map((item) => {
          const Icon = (item.icon !== undefined && ICONS[item.icon]) || Sparkles;
          return (
            <div
              key={item.title}
              className="bg-card flex flex-col items-center gap-4 rounded-xl border p-8 text-center shadow-sm"
            >
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                <Icon className="size-6" />
              </div>
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
