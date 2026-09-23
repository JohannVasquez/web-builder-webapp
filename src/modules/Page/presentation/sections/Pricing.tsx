'use client';

import Link from 'next/link';
import { useState, type ReactElement } from 'react';
import { z } from 'zod';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button';
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
import { HEADING_TAGS, subHeadingLevel } from '@/shared/lib/heading';
import type { SectionComponentProps } from '../SectionComponentProps';

const PRICING_VARIANTS = ['cards', 'table'] as const;

const PRICING_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof PRICING_VARIANTS)[number], SectionLayoutDefaults>
> = {
  cards: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'center' },
  table: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'center' },
};

const PlanSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  priceMonthly: z.number(),
  // Sin este valor, el plan muestra `priceMonthly` también en el ciclo anual.
  priceYearly: z.number().optional(),
  currency: z.string().default('CLP'),
  features: z.array(z.string()).default([]),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  featured: z.boolean().default(false),
});

const PricingPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  subtitle: z.string().optional(),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  // `cards` (default, una tarjeta por plan) o `table` (comparativa en tabla).
  variant: z.enum(PRICING_VARIANTS).default('cards').catch('cards'),
  // Muestra un conmutador mensual/anual sobre los planes.
  showBillingToggle: z.boolean().default(false),
  plans: z.array(PlanSchema).default([]),
});

type Plan = z.infer<typeof PlanSchema>;
type Billing = 'monthly' | 'yearly';

const GRID_COLUMNS_CLASS: Readonly<Record<number, string>> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

const gridColumnsClassName = (count: number): string =>
  GRID_COLUMNS_CLASS[count] ?? GRID_COLUMNS_CLASS[4];

const formatPrice = (amount: number, currency: string): string =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

const planPrice = (plan: Plan, billing: Billing): { amount: number; period: string } => {
  if (billing === 'yearly' && plan.priceYearly !== undefined) {
    return { amount: plan.priceYearly, period: '/año' };
  }
  return { amount: plan.priceMonthly, period: '/mes' };
};

function BillingToggle({
  billing,
  onChange,
}: {
  readonly billing: Billing;
  readonly onChange: (billing: Billing) => void;
}): ReactElement {
  return (
    <div
      role="group"
      aria-label="Ciclo de facturación"
      className="mx-auto mb-10 flex w-fit items-center gap-1 rounded-full border p-1"
    >
      {(['monthly', 'yearly'] as const).map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={billing === option}
          onClick={() => onChange(option)}
          className={cn(
            'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
            billing === option
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground',
          )}
        >
          {option === 'monthly' ? 'Mensual' : 'Anual'}
        </button>
      ))}
    </div>
  );
}

function PlanFeatures({
  features,
}: {
  readonly features: readonly string[];
}): ReactElement | null {
  if (features.length === 0) {
    return null;
  }
  return (
    <ul className="mt-6 flex flex-col gap-2.5 text-left text-sm">
      {features.map((feature) => (
        <li key={feature} className="flex items-start gap-2">
          <Check className="text-primary mt-0.5 size-4 shrink-0" />
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function PlanCta({ plan }: { readonly plan: Plan }): ReactElement | null {
  if (plan.ctaLabel === undefined || plan.ctaHref === undefined) {
    return null;
  }
  return (
    <Button
      asChild
      className="mt-8 w-full"
      variant={plan.featured ? 'default' : 'outline'}
    >
      <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
    </Button>
  );
}

export function Pricing({
  sectionProps,
  headingLevel = 2,
}: SectionComponentProps): ReactElement | null {
  const Heading = HEADING_TAGS[headingLevel];
  const SubHeading = HEADING_TAGS[subHeadingLevel(headingLevel)];
  const parsed = PricingPropsSchema.safeParse(sectionProps);
  const [billing, setBilling] = useState<Billing>('monthly');

  if (!parsed.success) {
    return null;
  }
  const { eyebrow, title, subtitle, plans, variant, showBillingToggle } = parsed.data;
  if (plans.length === 0) {
    return null;
  }
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(parsed.data, PRICING_LAYOUT_DEFAULTS[variant]);

  const header = (eyebrow !== undefined || title !== '' || subtitle !== undefined) && (
    <div className="mx-auto mb-12 max-w-2xl">
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
        <Heading
          className={cn(
            'ui-heading text-3xl md:text-4xl',
            hasBackgroundImage && 'text-white',
          )}
        >
          {title}
        </Heading>
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
  );

  if (variant === 'table') {
    return (
      <section
        className={layout.section}
        style={sectionBackgroundStyle(parsed.data)}
        data-variant={variant}
        {...sectionSurfaceAttributes(parsed.data)}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          {header}
          {showBillingToggle && <BillingToggle billing={billing} onChange={setBilling} />}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr>
                  <th className="w-0" />
                  {plans.map((plan) => {
                    const price = planPrice(plan, billing);
                    return (
                      <th
                        key={plan.name}
                        className={cn(
                          'ui-card p-5 align-bottom font-normal',
                          plan.featured && 'border-primary',
                        )}
                      >
                        {plan.featured && (
                          <span className="bg-primary text-primary-foreground mb-2 inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold">
                            Más popular
                          </span>
                        )}
                        <div className="text-lg font-bold">{plan.name}</div>
                        <div className="mt-1 text-2xl font-bold">
                          {formatPrice(price.amount, plan.currency)}
                          <span className="text-muted-foreground text-sm font-normal">
                            {price.period}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row" className="p-5 text-sm font-semibold">
                    Incluye
                  </th>
                  {plans.map((plan) => (
                    <td key={plan.name} className="p-5 align-top">
                      <PlanFeatures features={plan.features} />
                    </td>
                  ))}
                </tr>
                <tr>
                  <th scope="row" className="p-5" />
                  {plans.map((plan) => (
                    <td key={plan.name} className="p-5 align-top">
                      <PlanCta plan={plan} />
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
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
        {showBillingToggle && <BillingToggle billing={billing} onChange={setBilling} />}
        <div className={cn('grid gap-6', gridColumnsClassName(plans.length))}>
          {plans.map((plan) => {
            const price = planPrice(plan, billing);
            return (
              <div
                key={plan.name}
                className={cn(
                  'ui-card flex flex-col p-8 text-left',
                  plan.featured && 'border-primary ring-primary ring-2',
                )}
              >
                {plan.featured && (
                  <span className="bg-primary text-primary-foreground mb-4 w-fit rounded-full px-3 py-1 text-xs font-semibold">
                    Más popular
                  </span>
                )}
                <SubHeading className="text-xl font-bold">{plan.name}</SubHeading>
                {plan.description !== undefined && (
                  <p className="text-muted-foreground mt-1 text-sm">{plan.description}</p>
                )}
                <p className="mt-6 text-4xl font-bold">
                  {formatPrice(price.amount, plan.currency)}
                  <span className="text-muted-foreground text-base font-normal">
                    {price.period}
                  </span>
                </p>
                <PlanFeatures features={plan.features} />
                <PlanCta plan={plan} />
              </div>
            );
          })}
        </div>
      </RevealOnScroll>
    </section>
  );
}
