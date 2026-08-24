import type { ReactElement } from 'react';
import { z } from 'zod';
import { cn } from '@/shared/lib/utils';
import type { SectionComponentProps } from '../SectionComponentProps';

const StatsPropsSchema = z.object({
  title: z.string().optional(),
  /** Colores CSS definidos en la BD; sin ellos se usa el tema por defecto. */
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  /** Color CSS de las cifras, para destacarlas sobre el fondo. */
  accentColor: z.string().optional(),
  items: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    )
    .default([]),
});

export function Stats({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = StatsPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, items, backgroundColor, textColor, accentColor } = parsed.data;

  return (
    <section className="bg-secondary/40" style={{ backgroundColor, color: textColor }}>
      <div className="mx-auto max-w-5xl px-6 py-16">
        {title !== undefined && (
          <h2 className="mb-10 text-center text-3xl font-bold tracking-tight md:text-4xl">
            {title}
          </h2>
        )}
        <dl
          className={cn(
            'grid grid-cols-2 gap-10 text-center',
            items.length % 4 === 0 ? 'md:grid-cols-4' : 'md:grid-cols-3',
          )}
        >
          {items.map((item) => (
            <div key={item.label} className="flex flex-col gap-2">
              <dd
                className="order-first text-4xl font-bold tracking-tight md:text-5xl"
                style={accentColor !== undefined ? { color: accentColor } : undefined}
              >
                {item.value}
              </dd>
              <dt
                className={
                  textColor === undefined
                    ? 'text-muted-foreground text-sm'
                    : 'text-sm opacity-80'
                }
              >
                {item.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
