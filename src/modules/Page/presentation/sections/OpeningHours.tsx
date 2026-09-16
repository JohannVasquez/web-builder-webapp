'use client';

import { useCallback, useSyncExternalStore, type ReactElement } from 'react';
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
import {
  DAY_ORDER,
  formatRange,
  groupConsecutiveDays,
  isOpenAt,
  type DayHours,
  type DayName,
  type Holiday,
} from './openingHoursSchedule';

const OPENING_HOURS_VARIANTS = ['list', 'compact'] as const;

const OPENING_HOURS_LAYOUT_DEFAULTS: Readonly<
  Record<(typeof OPENING_HOURS_VARIANTS)[number], SectionLayoutDefaults>
> = {
  list: { paddingY: 'normal', contentWidth: 'narrow', textAlign: 'left' },
  compact: { paddingY: 'normal', contentWidth: 'tight', textAlign: 'left' },
};

const DayHoursSchema = z.object({
  day: z.enum(DAY_ORDER),
  open: z.string().optional(),
  close: z.string().optional(),
  closed: z.boolean().optional(),
  note: z.string().optional(),
});

const HolidaySchema = z.object({
  date: z.string(),
  note: z.string().optional(),
});

const OpeningHoursPropsSchema = z.object({
  eyebrow: z.string().optional(),
  title: z.string().default(''),
  ...SectionBackgroundPropsSchema.shape,
  ...SectionLayoutPropsSchema.shape,
  // Zona horaria del negocio, no la del visitante: define qué significa "abierto ahora".
  timezone: z.string().default('America/Santiago'),
  days: z.array(DayHoursSchema).default([]),
  holidays: z.array(HolidaySchema).optional(),
  // `list` (default): un día por línea. `compact`: agrupa días seguidos con el mismo horario.
  variant: z.enum(OPENING_HOURS_VARIANTS).default('list').catch('list'),
});

const DAY_LABELS: Readonly<Record<DayName, string>> = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
};

const OPEN_STATUS_POLL_MS = 60_000;

// `getServerSnapshot` devuelve `null`: en el servidor no sabemos qué hora es "ahora" para el
// visitante, así que el indicador simplemente no se pinta hasta que el cliente confirme la
// hora real. Los horarios en sí (lo indexable) no dependen de esto y van siempre en el HTML.
function useIsOpenNow(
  days: readonly DayHours[],
  holidays: readonly Holiday[] | undefined,
  timezone: string,
): boolean | null {
  const subscribe = useCallback((onStoreChange: () => void): (() => void) => {
    const id = setInterval(onStoreChange, OPEN_STATUS_POLL_MS);
    return () => clearInterval(id);
  }, []);
  const getSnapshot = useCallback(
    (): boolean => isOpenAt(days, holidays, new Date(), timezone),
    [days, holidays, timezone],
  );
  const getServerSnapshot = useCallback((): null => null, []);

  return useSyncExternalStore<boolean | null>(subscribe, getSnapshot, getServerSnapshot);
}

function dayLine(entry: DayHours): string {
  if (entry.closed === true || entry.open === undefined || entry.close === undefined) {
    return 'Cerrado';
  }
  return formatRange(entry.open, entry.close);
}

export function OpeningHours({
  sectionProps,
}: SectionComponentProps): ReactElement | null {
  const parsed = OpeningHoursPropsSchema.safeParse(sectionProps);
  const days = parsed.success ? parsed.data.days : [];
  const holidays = parsed.success ? parsed.data.holidays : undefined;
  const timezone = parsed.success ? parsed.data.timezone : 'America/Santiago';
  const isOpen = useIsOpenNow(days, holidays, timezone);

  if (!parsed.success || days.length === 0) {
    return null;
  }
  const { eyebrow, title, variant } = parsed.data;
  const hasBackgroundImage = parsed.data.backgroundImageUrl !== undefined;
  const layout = sectionLayoutClasses(
    parsed.data,
    OPENING_HOURS_LAYOUT_DEFAULTS[variant],
  );
  const orderedDays = [...days].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );

  const header = (
    <div className="mb-8 flex flex-col gap-3">
      {eyebrow !== undefined && (
        <p
          className={cn(
            'text-sm font-semibold tracking-wide uppercase',
            hasBackgroundImage ? 'text-white/80' : 'text-muted-foreground',
          )}
        >
          {eyebrow}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <h2
          className={cn(
            'ui-heading text-3xl md:text-4xl',
            hasBackgroundImage && 'text-white',
          )}
        >
          {title}
        </h2>
        {isOpen !== null && (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
              isOpen ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
            )}
          >
            <span className="size-2 rounded-full bg-current" aria-hidden="true" />
            {isOpen ? 'Abierto ahora' : 'Cerrado ahora'}
          </span>
        )}
      </div>
    </div>
  );

  const holidayList =
    holidays !== undefined && holidays.length > 0 ? (
      <div className="border-border mt-6 border-t pt-6">
        <p
          className={cn(
            'mb-2 text-xs font-semibold tracking-wide uppercase',
            hasBackgroundImage ? 'text-white/70' : 'text-muted-foreground',
          )}
        >
          Feriados
        </p>
        <ul className="flex flex-col gap-1 text-sm">
          {holidays.map((holiday) => (
            <li
              key={holiday.date}
              className={hasBackgroundImage ? 'text-white/80' : undefined}
            >
              {holiday.date}
              {holiday.note !== undefined ? ` — ${holiday.note}` : ''}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  if (variant === 'compact') {
    const groups = groupConsecutiveDays(orderedDays);

    return (
      <section
        className={layout.section}
        style={sectionBackgroundStyle(parsed.data)}
        data-variant={variant}
        {...sectionSurfaceAttributes(parsed.data)}
      >
        <RevealOnScroll animation={parsed.data.animation} className={layout.container}>
          {header}
          <div className="ui-card flex flex-col divide-y divide-border p-6">
            {groups.map((group) => {
              const label =
                group.days.length > 1
                  ? `${DAY_LABELS[group.days[0]]} a ${DAY_LABELS[group.days[group.days.length - 1]].toLowerCase()}`
                  : DAY_LABELS[group.days[0]];
              const schedule =
                group.closed === true ||
                group.open === undefined ||
                group.close === undefined
                  ? 'Cerrado'
                  : formatRange(group.open, group.close);

              return (
                <div
                  key={group.days.join('-')}
                  className="flex items-center justify-between gap-4 py-2.5 text-sm first:pt-0 last:pb-0"
                >
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">{schedule}</span>
                </div>
              );
            })}
          </div>
          {holidayList}
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
        <div className="ui-card flex flex-col divide-y divide-border p-6">
          {orderedDays.map((entry) => (
            <div
              key={entry.day}
              className="flex flex-col gap-0.5 py-2.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="font-medium">{DAY_LABELS[entry.day]}</span>
              <span className="text-muted-foreground text-sm">
                {dayLine(entry)}
                {entry.note !== undefined ? ` · ${entry.note}` : ''}
              </span>
            </div>
          ))}
        </div>
        {holidayList}
      </RevealOnScroll>
    </section>
  );
}
