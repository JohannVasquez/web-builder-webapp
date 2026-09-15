import type { ReactElement } from 'react';
import { z } from 'zod';
import { cn } from '@/shared/lib/utils';
import {
  SectionBackgroundPropsSchema,
  sectionBackgroundStyle,
} from '@/shared/lib/sectionBackground';
import type { SectionComponentProps } from '../SectionComponentProps';

const ColumnItemSchema = z.object({
  /** URL absoluta (bucket del módulo FileStorage). Sin ella, la columna es solo texto. */
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  /** Línea corta sobre el título de la columna (ej. "Paso 1"). */
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  content: z.string().optional(),
});

const ColumnsPropsSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  ...SectionBackgroundPropsSchema.shape,
  accentColor: z.string().optional(),
  /**
   * 1 a 4 columnas; cada una es una foto, texto, o ambos (foto arriba +
   * texto de pie abajo). El layout genérico para maquetar cualquier
   * sección de "N cosas en fila" sin necesitar un componente específico
   * por caso de uso.
   */
  columns: z.array(ColumnItemSchema).min(1).max(4).default([]),
});

const GRID_COLUMNS_CLASS: Readonly<Record<number, string>> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

export function Columns({ sectionProps }: SectionComponentProps): ReactElement | null {
  const parsed = ColumnsPropsSchema.safeParse(sectionProps);
  if (!parsed.success) {
    return null;
  }
  const { title, subtitle, columns, accentColor } = parsed.data;
  if (columns.length === 0) {
    return null;
  }
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const gridColumns = GRID_COLUMNS_CLASS[columns.length] ?? 'md:grid-cols-3';

  return (
    <section style={sectionBackgroundStyle(parsed.data)}>
      <div className="mx-auto max-w-6xl px-6 py-20">
        {(title !== undefined || subtitle !== undefined) && (
          <div className="mx-auto mb-14 max-w-2xl text-center">
            {title !== undefined && (
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
        <div className={cn('grid gap-10', gridColumns)}>
          {columns.map((column, index) => {
            const hasImage = column.imageUrl !== undefined;
            const hasText =
              column.eyebrow !== undefined ||
              column.title !== undefined ||
              column.content !== undefined;
            return (
              <div key={index} className="flex flex-col gap-4">
                {hasImage && (
                  // eslint-disable-next-line @next/next/no-img-element -- URLs dinámicas del bucket, fuera del optimizador de next/image
                  <img
                    src={column.imageUrl}
                    alt={column.imageAlt ?? ''}
                    className="aspect-4/3 w-full rounded-xl object-cover shadow-sm"
                  />
                )}
                {hasText && (
                  <div>
                    {column.eyebrow !== undefined && (
                      <p
                        className={cn(
                          'mb-1 text-xs font-semibold tracking-wide uppercase',
                          hasBackgroundImage &&
                            accentColor === undefined &&
                            'text-white/80',
                        )}
                        style={
                          accentColor !== undefined ? { color: accentColor } : undefined
                        }
                      >
                        {column.eyebrow}
                      </p>
                    )}
                    {column.title !== undefined && (
                      <h3
                        className={cn(
                          'text-lg font-semibold',
                          hasBackgroundImage && 'text-white',
                        )}
                      >
                        {column.title}
                      </h3>
                    )}
                    {column.content !== undefined && (
                      <p
                        className={cn(
                          'mt-2 text-sm leading-relaxed',
                          hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground',
                        )}
                      >
                        {column.content}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
