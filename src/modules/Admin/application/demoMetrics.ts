import type {
  DemoMetrics,
  DemoMetricsGroup,
  DemoMetricsGrouping,
  DiscardReasonBucket,
} from '../domain/DemoApi';
import { DISCARD_REASON_OPTIONS } from './demoPresentation';

// La API cuenta los días en hora de Chile: el rango se arma en la misma zona para que "hoy"
// no se corra un día de noche.
export const METRICS_TIME_ZONE = 'America/Santiago';

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const todayInChile = (now: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: METRICS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);

const addDays = (day: string, days: number): string => {
  const [year, month, date] = day.split('-').map(Number);
  const shifted = new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, (date ?? 1) + days));
  return shifted.toISOString().slice(0, 10);
};

export type MetricsRangePreset = 'last-30' | 'last-90' | 'this-year' | 'custom';

export const METRICS_RANGE_OPTIONS: readonly {
  value: MetricsRangePreset;
  label: string;
}[] = [
  { value: 'last-30', label: 'Últimos 30 días' },
  { value: 'last-90', label: 'Últimos 90 días' },
  { value: 'this-year', label: 'Este año' },
  { value: 'custom', label: 'Personalizado' },
];

export interface MetricsRange {
  readonly from: string;
  readonly to: string;
}

// Rangos que incluyen hoy, igual que la API ("últimos 90 días contando hoy").
export const rangeForPreset = (
  preset: Exclude<MetricsRangePreset, 'custom'>,
  today: string,
): MetricsRange => {
  if (preset === 'this-year') {
    return { from: `${today.slice(0, 4)}-01-01`, to: today };
  }
  return { from: addDays(today, preset === 'last-30' ? -29 : -89), to: today };
};

// Un rango a medio escribir no se manda: la API respondería 400 y la pantalla mostraría un
// error por algo que la persona todavía está tipeando.
export const validateCustomRange = (range: MetricsRange): string | null => {
  if (!DAY_PATTERN.test(range.from) || !DAY_PATTERN.test(range.to)) {
    return 'Elige la fecha de inicio y la de término.';
  }
  if (range.from > range.to) {
    return 'La fecha de inicio tiene que ser anterior a la de término.';
  }
  return null;
};

export const buildMetricsPath = (
  range: MetricsRange,
  groupBy: DemoMetricsGrouping,
): string => {
  const params = new URLSearchParams({ from: range.from, to: range.to, groupBy });
  return `/api/admin/demos/metrics?${params.toString()}`;
};

export const METRICS_GROUPING_OPTIONS: readonly {
  value: DemoMetricsGrouping;
  label: string;
}[] = [
  { value: 'industry', label: 'Rubro' },
  { value: 'template', label: 'Kit' },
  { value: 'creator', label: 'Vendedor' },
  { value: 'month', label: 'Mes' },
];

const percentFormat = new Intl.NumberFormat('es-CL', {
  style: 'percent',
  maximumFractionDigits: 1,
});

const decimalFormat = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 });

// Nunca `NaN %`: un valor que no sea un número finito se muestra como cero.
export const formatRate = (rate: number): string =>
  percentFormat.format(Number.isFinite(rate) ? rate : 0);

export const formatDecimal = (value: number): string =>
  decimalFormat.format(Number.isFinite(value) ? value : 0);

export const formatMedianDays = (days: number | null): string => {
  if (days === null || !Number.isFinite(days)) {
    return 'Sin datos';
  }
  return days === 1 ? '1 día' : `${decimalFormat.format(days)} días`;
};

export const formatDay = (day: string): string => {
  const [year, month, date] = day.split('-').map(Number);
  return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, date ?? 1)).toLocaleDateString(
    'es-CL',
    { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' },
  );
};

// `AAAA-MM` → "septiembre de 2026". El resto de las agrupaciones ya trae su etiqueta.
export const groupLabel = (
  group: DemoMetricsGroup,
  groupBy: DemoMetricsGrouping,
  templateLabels: ReadonlyMap<string, string>,
): string => {
  if (group.key === null) {
    return group.label;
  }
  if (groupBy === 'month' && /^\d{4}-\d{2}$/.test(group.key)) {
    const [year, month] = group.key.split('-').map(Number);
    return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, 1)).toLocaleDateString(
      'es-CL',
      { month: 'long', year: 'numeric', timeZone: 'UTC' },
    );
  }
  if (groupBy === 'template') {
    return templateLabels.get(group.key) ?? group.label;
  }
  return group.label;
};

export type GroupSort = 'default' | 'conversion-desc' | 'conversion-asc';

// Ordenar por conversión no mezcla "Sin rubro" / "Sin kit" con los demás: siguen al final,
// como los deja la API.
export const sortGroups = (
  groups: readonly DemoMetricsGroup[],
  sort: GroupSort,
): readonly DemoMetricsGroup[] => {
  if (sort === 'default') {
    return groups;
  }
  const direction = sort === 'conversion-desc' ? -1 : 1;
  const known = groups
    .filter((group) => group.key !== null)
    .sort(
      (a, b) =>
        direction * (a.funnel.conversionRate - b.funnel.conversionRate) ||
        b.funnel.created - a.funnel.created,
    );
  return [...known, ...groups.filter((group) => group.key === null)];
};

export const isEmptyPeriod = (metrics: DemoMetrics): boolean =>
  metrics.funnel.created === 0;

export const DISCARD_BUCKET_LABELS: Record<DiscardReasonBucket, string> = {
  ...(Object.fromEntries(
    DISCARD_REASON_OPTIONS.map((option) => [option.value, option.label]),
  ) as Record<Exclude<DiscardReasonBucket, 'sin-motivo'>, string>),
  'sin-motivo': 'Sin motivo',
};

export interface OutcomeRow {
  readonly label: string;
  readonly count: number;
  readonly detail?: string;
}

// El mismo orden en que se lee el destino de una demo; suman las creadas del período.
export const outcomeRows = (outcomes: DemoMetrics['outcomes']): readonly OutcomeRow[] => [
  { label: 'Vigentes', count: outcomes.active },
  { label: 'Vencidas sin respuesta', count: outcomes.expired },
  { label: 'Descartadas (dijo que no)', count: outcomes.discarded },
  {
    label: 'Descartadas por otra propuesta',
    count: outcomes.otraPropuesta,
    detail: 'El prospecto compró otra propuesta suya: no es un "no".',
  },
  { label: 'Convertidas en cliente', count: outcomes.converted },
];

export const discardReasonRows = (
  reasons: DemoMetrics['outcomes']['discardReasons'],
): readonly OutcomeRow[] =>
  (Object.keys(DISCARD_BUCKET_LABELS) as DiscardReasonBucket[]).map((bucket) => ({
    label: DISCARD_BUCKET_LABELS[bucket],
    count: reasons[bucket],
  }));
