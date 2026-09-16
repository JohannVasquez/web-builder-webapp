'use client';

import { useEffect, useRef, useState, type ReactElement } from 'react';
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

const STATS_VARIANTS = ['row', 'cards', 'counter'] as const;

const STATS_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof STATS_VARIANTS)[number], SectionLayoutDefaults>
> = {
  row: { paddingY: 'compact', contentWidth: 'normal', textAlign: 'left' },
  cards: { paddingY: 'normal', contentWidth: 'wide', textAlign: 'left' },
  counter: { paddingY: 'compact', contentWidth: 'normal', textAlign: 'left' },
};

const StatsPropsSchema = z.object({
  title: z.string().optional(),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  // Color CSS del texto; sin él, blanco automático sobre imagen de fondo.
  textColor: z.string().optional(),
  // Color CSS de las cifras, para destacarlas sobre el fondo.
  accentColor: z.string().optional(),
  items: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    )
    .default([]),
  // `row` (default): cifras en línea. `cards`: cada cifra dentro de una tarjeta. `counter`: la cifra cuenta desde 0 al entrar en pantalla.
  variant: z.enum(STATS_VARIANTS).default('row').catch('row'),
});

const COUNT_DURATION_MS = 1200;
const COUNTER_NUMBER_PATTERN = /\d[\d.,]*\d|\d/;
const NUMBER_FORMATTER = new Intl.NumberFormat('es-CL');

interface ParsedCounterValue {
  readonly prefix: string;
  readonly target: number;
  readonly suffix: string;
}

// Extrae el número de una cifra como "+1.200" (prefijo "+", objetivo 1200) o "24/7" (objetivo 24, sufijo "/7").
function parseCounterValue(value: string): ParsedCounterValue | null {
  const match = COUNTER_NUMBER_PATTERN.exec(value);
  if (match === null) {
    return null;
  }
  const target = Number(match[0].replace(/\D/g, ''));
  if (!Number.isFinite(target)) {
    return null;
  }
  return {
    prefix: value.slice(0, match.index),
    target,
    suffix: value.slice(match.index + match[0].length),
  };
}

function formatCounterValue(parsed: ParsedCounterValue, current: number): string {
  return `${parsed.prefix}${NUMBER_FORMATTER.format(current)}${parsed.suffix}`;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  );
}

interface CounterValueProps {
  readonly value: string;
}

// El estado inicial ya es el valor final: el efecto solo lo lleva a 0 para animar cuando corresponde.
function CounterValue({ value }: CounterValueProps): ReactElement {
  const parsed = parseCounterValue(value);
  const ref = useRef<HTMLSpanElement>(null);
  const [current, setCurrent] = useState(parsed?.target ?? 0);

  useEffect(() => {
    if (parsed === null || prefersReducedMotion()) {
      return;
    }
    const node = ref.current;
    if (node === null || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting !== true) {
          return;
        }
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number): void => {
          const progress = Math.min((now - start) / COUNT_DURATION_MS, 1);
          setCurrent(Math.round(progress * parsed.target));
          if (progress < 1) {
            requestAnimationFrame(tick);
          }
        };
        setCurrent(0);
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `value` no cambia sin remontar el item (key=label)
  }, []);

  if (parsed === null) {
    return <span ref={ref}>{value}</span>;
  }

  return <span ref={ref}>{formatCounterValue(parsed, current)}</span>;
}

export function Stats({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = StatsPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, items, textColor, accentColor, variant } = parsed.data;
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(parsed.data, STATS_LAYOUT_DEFAULTS[variant]);
  const gridColumns = items.length % 4 === 0 ? 'md:grid-cols-4' : 'md:grid-cols-3';
  const sectionStyle = {
    ...sectionBackgroundStyle(parsed.data),
    // Va sobre el velo oscuro de la imagen de fondo, no sobre el fondo del tema.
    color: textColor ?? (hasBackgroundImage ? '#ffffff' : undefined),
  };
  const dtClassName =
    textColor === undefined && !hasBackgroundImage
      ? 'text-muted-foreground text-sm'
      : 'text-sm opacity-80';

  if (variant === 'cards') {
    return (
      <section
        className={cn('ui-surface', layout.section)}
        style={sectionStyle}
        {...sectionSurfaceAttributes(parsed.data)}
        data-variant={variant}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          {title !== undefined && (
            <h2 className="ui-heading mb-10 text-center text-3xl md:text-4xl">{title}</h2>
          )}
          <dl className={cn('grid grid-cols-2 gap-6 text-center', gridColumns)}>
            {items.map((item) => (
              <div key={item.label} className="ui-card flex flex-col gap-2 p-6">
                <dd
                  className="order-first text-4xl font-bold tracking-tight md:text-5xl"
                  style={accentColor !== undefined ? { color: accentColor } : undefined}
                >
                  {item.value}
                </dd>
                <dt className={dtClassName}>{item.label}</dt>
              </div>
            ))}
          </dl>
        </RevealOnScroll>
      </section>
    );
  }

  if (variant === 'counter') {
    return (
      <section
        className={cn('ui-surface', layout.section)}
        style={sectionStyle}
        {...sectionSurfaceAttributes(parsed.data)}
        data-variant={variant}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          {title !== undefined && (
            <h2 className="ui-heading mb-10 text-center text-3xl md:text-4xl">{title}</h2>
          )}
          <dl className={cn('grid grid-cols-2 gap-10 text-center', gridColumns)}>
            {items.map((item) => (
              <div key={item.label} className="flex flex-col gap-2">
                <dd
                  className="order-first text-4xl font-bold tracking-tight md:text-5xl"
                  style={accentColor !== undefined ? { color: accentColor } : undefined}
                >
                  <CounterValue value={item.value} />
                </dd>
                <dt className={dtClassName}>{item.label}</dt>
              </div>
            ))}
          </dl>
        </RevealOnScroll>
      </section>
    );
  }

  return (
    <section
      className={cn('ui-surface', layout.section)}
      style={sectionStyle}
      {...sectionSurfaceAttributes(parsed.data)}
      data-variant={variant}
    >
      <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
        {title !== undefined && (
          <h2 className="ui-heading mb-10 text-center text-3xl md:text-4xl">{title}</h2>
        )}
        <dl className={cn('grid grid-cols-2 gap-10 text-center', gridColumns)}>
          {items.map((item) => (
            <div key={item.label} className="flex flex-col gap-2">
              <dd
                className="order-first text-4xl font-bold tracking-tight md:text-5xl"
                style={accentColor !== undefined ? { color: accentColor } : undefined}
              >
                {item.value}
              </dd>
              <dt className={dtClassName}>{item.label}</dt>
            </div>
          ))}
        </dl>
      </RevealOnScroll>
    </section>
  );
}
