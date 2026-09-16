import Link from 'next/link';
import type { ReactElement } from 'react';
import { z } from 'zod';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
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

const SERVICE_CARDS_VARIANTS = ['grid', 'carousel', 'accordion'] as const;

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
  // `grid` (default): tarjetas en grilla. `carousel`: fila deslizable. `accordion`: cada servicio se despliega al tocarlo.
  variant: z.enum(SERVICE_CARDS_VARIANTS).default('grid').catch('grid'),
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

// Elige columnas que dejen filas parejas (múltiplos de 3 usan 3, si no 4); clases literales para que Tailwind las detecte.
const gridColumnsClassName = (count: number): string => {
  if (count === 1) {
    return 'md:grid-cols-1';
  }
  if (count === 2) {
    return 'md:grid-cols-2';
  }
  return count % 3 === 0 ? 'md:grid-cols-3' : 'md:grid-cols-4';
};

type ServiceItem = z.infer<typeof ServiceCardsPropsSchema>['items'][number];

function ServiceIconBadge({
  item,
  accentColor,
}: {
  readonly item: ServiceItem;
  readonly accentColor: string | undefined;
}): ReactElement {
  const Icon = (item.icon !== undefined && ICONS[item.icon]) || Sparkles;
  return (
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
  );
}

function ServiceChecklist({
  checklist,
  accentColor,
}: {
  readonly checklist: readonly string[];
  readonly accentColor: string | undefined;
}): ReactElement | null {
  if (checklist.length === 0) {
    return null;
  }
  return (
    <ul className="mt-5 space-y-2">
      {checklist.map((line) => (
        <li key={line} className="flex items-start gap-2 text-sm">
          <Check
            className="mt-0.5 size-4 shrink-0"
            style={accentColor !== undefined ? { color: accentColor } : undefined}
          />
          <span className="text-muted-foreground">{line}</span>
        </li>
      ))}
    </ul>
  );
}

function ServiceLink({
  item,
  accentColor,
}: {
  readonly item: ServiceItem;
  readonly accentColor: string | undefined;
}): ReactElement | null {
  if (item.linkLabel === undefined || item.linkHref === undefined) {
    return null;
  }
  return (
    <Link
      href={item.linkHref}
      className="mt-6 flex items-center gap-1.5 text-sm font-semibold hover:underline"
      style={accentColor !== undefined ? { color: accentColor } : undefined}
    >
      {item.linkLabel}
      <ArrowRight className="size-4" />
    </Link>
  );
}

function SectionHeader({
  title,
  subtitle,
  hasBackgroundImage,
}: {
  readonly title: string;
  readonly subtitle: string | undefined;
  readonly hasBackgroundImage: boolean;
}): ReactElement | null {
  if (title === '' && subtitle === undefined) {
    return null;
  }
  return (
    <div className="mx-auto mb-14 max-w-2xl text-center">
      {title !== '' && (
        <h2 className={cn('ui-heading text-3xl md:text-4xl', hasBackgroundImage && 'text-white')}>
          {title}
        </h2>
      )}
      {subtitle !== undefined && (
        <p className={cn('mt-3', hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground')}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ViewAllLink({
  viewAllLabel,
  viewAllHref,
  accentColor,
}: {
  readonly viewAllLabel: string | undefined;
  readonly viewAllHref: string | undefined;
  readonly accentColor: string | undefined;
}): ReactElement | null {
  if (viewAllLabel === undefined || viewAllHref === undefined) {
    return null;
  }
  return (
    <div className="mt-12 text-center">
      <Link
        href={viewAllHref}
        className="hover:bg-accent inline-flex items-center gap-2 rounded-md border px-6 py-2.5 text-sm font-semibold transition-colors"
        style={
          accentColor !== undefined ? { borderColor: accentColor, color: accentColor } : undefined
        }
      >
        {viewAllLabel}
      </Link>
    </div>
  );
}

export function ServiceCards({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = ServiceCardsPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, subtitle, items, accentColor, viewAllLabel, viewAllHref, variant } = parsed.data;
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(parsed.data, {
    paddingY: 'normal',
    contentWidth: 'wide',
    textAlign: 'left',
  });

  if (variant === 'carousel') {
    return (
      <section
        className={layout.section}
        style={sectionBackgroundStyle(parsed.data)}
        {...sectionSurfaceAttributes(parsed.data)}
        data-variant={variant}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          <SectionHeader title={title} subtitle={subtitle} hasBackgroundImage={hasBackgroundImage} />
          <div
            tabIndex={0}
            aria-label={title !== '' ? title : 'Servicios'}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2"
          >
            {items.map((item) => (
              <div
                key={item.title}
                className="ui-card flex w-[85%] shrink-0 snap-start flex-col p-7 md:w-[45%] lg:w-[30%]"
              >
                <ServiceIconBadge item={item} accentColor={accentColor} />
                <h3 className="mt-5 text-base font-bold tracking-wide uppercase">{item.title}</h3>
                <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                  {item.description}
                </p>
                <ServiceChecklist checklist={item.checklist} accentColor={accentColor} />
                <ServiceLink item={item} accentColor={accentColor} />
              </div>
            ))}
          </div>
          <ViewAllLink
            viewAllLabel={viewAllLabel}
            viewAllHref={viewAllHref}
            accentColor={accentColor}
          />
        </RevealOnScroll>
      </section>
    );
  }

  if (variant === 'accordion') {
    return (
      <section
        className={layout.section}
        style={sectionBackgroundStyle(parsed.data)}
        {...sectionSurfaceAttributes(parsed.data)}
        data-variant={variant}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          <SectionHeader title={title} subtitle={subtitle} hasBackgroundImage={hasBackgroundImage} />
          <div className="space-y-3">
            {items.map((item) => (
              <details key={item.title} className="ui-card group p-2">
                <summary className="flex list-none items-center gap-4 p-3 [&::-webkit-details-marker]:hidden">
                  <ServiceIconBadge item={item} accentColor={accentColor} />
                  <span className="flex-1 text-base font-bold tracking-wide uppercase">
                    {item.title}
                  </span>
                  <ChevronDown className="size-5 shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-3 pt-1 pb-4 md:pl-[4.75rem]">
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {item.description}
                  </p>
                  <ServiceChecklist checklist={item.checklist} accentColor={accentColor} />
                  <ServiceLink item={item} accentColor={accentColor} />
                </div>
              </details>
            ))}
          </div>
          <ViewAllLink
            viewAllLabel={viewAllLabel}
            viewAllHref={viewAllHref}
            accentColor={accentColor}
          />
        </RevealOnScroll>
      </section>
    );
  }

  const gridColumns = gridColumnsClassName(items.length);

  return (
    <section
      className={layout.section}
      style={sectionBackgroundStyle(parsed.data)}
      {...sectionSurfaceAttributes(parsed.data)}
      data-variant={variant}
    >
      <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
        <SectionHeader title={title} subtitle={subtitle} hasBackgroundImage={hasBackgroundImage} />
        <div className={cn('grid gap-6', gridColumns)}>
          {items.map((item) => (
            <div key={item.title} className="ui-card flex flex-col p-7">
              <ServiceIconBadge item={item} accentColor={accentColor} />
              <h3 className="mt-5 text-base font-bold tracking-wide uppercase">{item.title}</h3>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
                {item.description}
              </p>
              <ServiceChecklist checklist={item.checklist} accentColor={accentColor} />
              <ServiceLink item={item} accentColor={accentColor} />
            </div>
          ))}
        </div>
        <ViewAllLink
          viewAllLabel={viewAllLabel}
          viewAllHref={viewAllHref}
          accentColor={accentColor}
        />
      </RevealOnScroll>
    </section>
  );
}
