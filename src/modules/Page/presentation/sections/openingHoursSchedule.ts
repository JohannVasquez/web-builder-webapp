// Lógica pura de horarios de atención: sin JSX ni DOM, así se prueba sin navegador.

export const DAY_ORDER = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo',
] as const;

export type DayName = (typeof DAY_ORDER)[number];

export interface DayHours {
  readonly day: DayName;
  readonly open?: string;
  readonly close?: string;
  readonly closed?: boolean;
  readonly note?: string;
}

export interface Holiday {
  readonly date: string;
  readonly note?: string;
}

export interface DayGroup {
  readonly days: readonly DayName[];
  readonly open?: string;
  readonly close?: string;
  readonly closed?: boolean;
  readonly note?: string;
}

const WEEKDAY_EN_TO_ES: Readonly<Record<string, DayName>> = {
  Monday: 'lunes',
  Tuesday: 'martes',
  Wednesday: 'miercoles',
  Thursday: 'jueves',
  Friday: 'viernes',
  Saturday: 'sabado',
  Sunday: 'domingo',
};

function toMinutes(value: string): number {
  const [hour, minute] = value.split(':');
  return Number(hour) * 60 + Number(minute);
}

function previousDay(day: DayName): DayName {
  const index = DAY_ORDER.indexOf(day);
  return DAY_ORDER[(index + DAY_ORDER.length - 1) % DAY_ORDER.length];
}

interface NowParts {
  readonly dateStr: string;
  readonly weekday: DayName;
  readonly minutesOfDay: number;
}

// `hourCycle: 'h23'` evita el bug conocido de algunos motores ICU que devuelven "24:00" para
// la medianoche con `hour12: false`.
function resolveNowParts(now: Date, timezone: string): NowParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const byType = new Map(
    formatter.formatToParts(now).map((part) => [part.type, part.value]),
  );
  const weekdayEn = byType.get('weekday') ?? 'Monday';

  return {
    dateStr: `${byType.get('year')}-${byType.get('month')}-${byType.get('day')}`,
    weekday: WEEKDAY_EN_TO_ES[weekdayEn] ?? 'lunes',
    minutesOfDay: Number(byType.get('hour')) * 60 + Number(byType.get('minute')),
  };
}

function isDayOpenAt(entry: DayHours | undefined, minutesOfDay: number): boolean {
  if (
    entry === undefined ||
    entry.closed === true ||
    entry.open === undefined ||
    entry.close === undefined
  ) {
    return false;
  }
  const openMinutes = toMinutes(entry.open);
  const closeMinutes = toMinutes(entry.close);
  if (closeMinutes > openMinutes) {
    return minutesOfDay >= openMinutes && minutesOfDay < closeMinutes;
  }
  // Cruza medianoche: desde que abre hasta el final del día sigue abierto.
  return minutesOfDay >= openMinutes;
}

function isOvernightContinuationOpen(
  entry: DayHours | undefined,
  minutesOfDay: number,
): boolean {
  if (
    entry === undefined ||
    entry.closed === true ||
    entry.open === undefined ||
    entry.close === undefined
  ) {
    return false;
  }
  const openMinutes = toMinutes(entry.open);
  const closeMinutes = toMinutes(entry.close);
  if (closeMinutes > openMinutes) {
    return false;
  }
  // El turno de ayer cruzó medianoche: seguimos abiertos hasta que cierre hoy.
  return minutesOfDay < closeMinutes;
}

// `now` es un instante absoluto; el día/hora "locales" del negocio se calculan según
// `timezone`, no según la zona del visitante ni la del servidor.
export function isOpenAt(
  days: readonly DayHours[],
  holidays: readonly Holiday[] | undefined,
  now: Date,
  timezone: string,
): boolean {
  const { dateStr, weekday, minutesOfDay } = resolveNowParts(now, timezone);

  const isHolidayToday = (holidays ?? []).some((holiday) => holiday.date === dateStr);
  if (isHolidayToday) {
    return false;
  }

  const today = days.find((entry) => entry.day === weekday);
  if (isDayOpenAt(today, minutesOfDay)) {
    return true;
  }

  const yesterday = days.find((entry) => entry.day === previousDay(weekday));
  return isOvernightContinuationOpen(yesterday, minutesOfDay);
}

function sameSchedule(a: DayHours, b: DayGroup): boolean {
  return (
    (a.closed ?? false) === (b.closed ?? false) &&
    a.open === b.open &&
    a.close === b.close
  );
}

// Agrupa días consecutivos (según `DAY_ORDER`) con exactamente el mismo horario, para
// mostrar "Lunes a viernes 9:00–18:00" en vez de repetir cada día.
export function groupConsecutiveDays(days: readonly DayHours[]): readonly DayGroup[] {
  const ordered = [...days].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );
  const groups: DayGroup[] = [];

  for (const entry of ordered) {
    const last = groups.at(-1);
    const lastDay = last?.days.at(-1);
    const isConsecutive =
      last !== undefined &&
      lastDay !== undefined &&
      DAY_ORDER.indexOf(entry.day) === DAY_ORDER.indexOf(lastDay) + 1 &&
      sameSchedule(entry, last);

    if (isConsecutive && last !== undefined) {
      groups[groups.length - 1] = { ...last, days: [...last.days, entry.day] };
    } else {
      groups.push({
        days: [entry.day],
        open: entry.open,
        close: entry.close,
        closed: entry.closed,
        note: entry.note,
      });
    }
  }

  return groups;
}

function formatTime(value: string): string {
  const [hour, minute] = value.split(':');
  return `${Number(hour)}:${minute}`;
}

export function formatRange(open: string, close: string): string {
  return `${formatTime(open)}–${formatTime(close)}`;
}
