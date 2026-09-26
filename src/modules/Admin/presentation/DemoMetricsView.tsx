'use client';

import { useMemo, useState, type ReactElement } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Loader2 } from 'lucide-react';
import { useSession } from '@/modules/Auth/presentation/SessionProvider';
import { SiteTemplatesSchema } from '../domain/AdminApi';
import {
  DemoMetricsSchema,
  type DemoMetrics,
  type DemoMetricsGrouping,
} from '../domain/DemoApi';
import {
  METRICS_GROUPING_OPTIONS,
  METRICS_RANGE_OPTIONS,
  buildMetricsPath,
  discardReasonRows,
  formatDay,
  formatDecimal,
  formatMedianDays,
  formatRate,
  groupLabel,
  isEmptyPeriod,
  outcomeRows,
  rangeForPreset,
  sortGroups,
  todayInChile,
  validateCustomRange,
  type GroupSort,
  type MetricsRange,
  type MetricsRangePreset,
} from '../application/demoMetrics';
import { DEMO_METRICS_PATH } from '../application/navLinks';
import { formatDemoDateTime } from '../application/demoPresentation';
import { useAdminApi } from './useAdminApi';
import { DemoSectionTabs } from './DemoSectionTabs';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import { cn } from '@/shared/lib/utils';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';

const SITE_TEMPLATES_CACHE_KEY = 'admin:site-templates';

export function DemoMetricsView(): ReactElement {
  const api = useAdminApi();
  const { session } = useSession();
  const [today] = useState(() => todayInChile());
  const [preset, setPreset] = useState<MetricsRangePreset>('last-30');
  const [custom, setCustom] = useState<MetricsRange>(() =>
    rangeForPreset('last-30', today),
  );
  // Mientras el rango personalizado esté a medio escribir se sigue mostrando el último válido.
  const [appliedCustom, setAppliedCustom] = useState<MetricsRange>(custom);
  const [groupBy, setGroupBy] = useState<DemoMetricsGrouping>('industry');

  const customProblem = preset === 'custom' ? validateCustomRange(custom) : null;
  const range = preset === 'custom' ? appliedCustom : rangeForPreset(preset, today);

  const updateCustom = (next: MetricsRange): void => {
    setCustom(next);
    if (validateCustomRange(next) === null) {
      setAppliedCustom(next);
    }
  };

  const path = buildMetricsPath(range, groupBy);
  const metrics = useAsyncData(`admin:demos:metrics:${path}`, () =>
    api.get(path, DemoMetricsSchema),
  );
  const templates = useAsyncData(SITE_TEMPLATES_CACHE_KEY, async () => {
    const { templates: list } = await api.get(
      '/api/admin/site-templates',
      SiteTemplatesSchema,
    );
    return list;
  });
  const templateLabels = useMemo(
    () =>
      new Map((templates.data ?? []).map((template) => [template.id, template.label])),
    [templates.data],
  );

  return (
    <div className="space-y-6">
      <DemoSectionTabs
        role={session?.user.role ?? 'client'}
        current={DEMO_METRICS_PATH}
      />
      <h1 className="ui-heading text-2xl">Métricas de demos</h1>

      <div className="space-y-3">
        <div
          role="group"
          aria-label="Período"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0"
        >
          {METRICS_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={preset === option.value}
              onClick={() => setPreset(option.value)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                preset === option.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <Label htmlFor="metrics-from">Desde</Label>
              <Input
                id="metrics-from"
                type="date"
                value={custom.from}
                max={today}
                onChange={(event) =>
                  updateCustom({ ...custom, from: event.target.value })
                }
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="metrics-to">Hasta</Label>
              <Input
                id="metrics-to"
                type="date"
                value={custom.to}
                onChange={(event) => updateCustom({ ...custom, to: event.target.value })}
              />
            </div>
            {customProblem !== null && (
              <p role="alert" className="text-destructive w-full text-sm">
                {customProblem}
              </p>
            )}
          </div>
        )}
      </div>

      {metrics.data === null ? (
        metrics.error !== null ? (
          <p role="alert" className="text-destructive">
            {metrics.error}
          </p>
        ) : (
          <p className="text-muted-foreground flex items-center gap-2">
            <Loader2 className="size-4 animate-spin" /> Calculando métricas...
          </p>
        )
      ) : (
        <DemoMetricsReport
          metrics={metrics.data}
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          templateLabels={templateLabels}
        />
      )}
    </div>
  );
}

export interface DemoMetricsReportProps {
  readonly metrics: DemoMetrics;
  readonly groupBy: DemoMetricsGrouping;
  readonly onGroupByChange: (groupBy: DemoMetricsGrouping) => void;
  readonly templateLabels: ReadonlyMap<string, string>;
}

// Todo lo que muestra sale tal cual de la respuesta de la API: la pantalla no recalcula
// ninguna tasa, así lo que ve la dueña coincide con lo que responde el agente.
export function DemoMetricsReport({
  metrics,
  groupBy,
  onGroupByChange,
  templateLabels,
}: DemoMetricsReportProps): ReactElement {
  const period = `${formatDay(metrics.range.from)} al ${formatDay(metrics.range.to)}`;

  if (isEmptyPeriod(metrics)) {
    return (
      <div className="ui-card space-y-1 p-6 text-center">
        <p className="font-medium">Todavía no hay demos en este período.</p>
        <p className="text-muted-foreground text-sm">
          Del {period}. Prueba con un rango más amplio.
        </p>
      </div>
    );
  }

  const { funnel, timing, engagement } = metrics;

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Demos creadas del {period}, en hora de Chile · estados al{' '}
        {formatDemoDateTime(metrics.asOf)}
      </p>

      <section aria-labelledby="metrics-funnel-heading" className="space-y-3">
        <h2 id="metrics-funnel-heading" className="ui-heading text-lg">
          Embudo
        </h2>
        <ol className="grid gap-3 sm:grid-cols-3">
          <FunnelStep
            label="Creadas"
            count={funnel.created}
            share={1}
            note={`${formatRate(1)} del período`}
          />
          <FunnelStep
            label="Abiertas por el prospecto"
            count={funnel.opened}
            share={funnel.openRate}
            note={`${formatRate(funnel.openRate)} de las creadas`}
          />
          <FunnelStep
            label="Convertidas en cliente"
            count={funnel.converted}
            share={funnel.conversionRate}
            note={`${formatRate(funnel.conversionRate)} de las creadas · ${formatRate(funnel.conversionRateOfOpened)} de las abiertas`}
          />
        </ol>
      </section>

      <section aria-label="Indicadores" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Tasa de apertura" value={formatRate(funnel.openRate)} />
        <StatTile label="Tasa de conversión" value={formatRate(funnel.conversionRate)} />
        <StatTile
          label="Mediana hasta la primera visita"
          value={formatMedianDays(timing.medianDaysToFirstVisit)}
        />
        <StatTile
          label="Mediana hasta la conversión"
          value={formatMedianDays(timing.medianDaysToConversion)}
        />
      </section>
      <p className="text-muted-foreground text-sm">
        {formatDecimal(engagement.avgVisitsPerOpenedDemo)} visitas en promedio por demo
        abierta · {formatDecimal(engagement.avgExtensions)} extensiones en promedio por
        demo.
      </p>

      <OutcomesTable metrics={metrics} />

      <GroupsTable
        metrics={metrics}
        groupBy={groupBy}
        onGroupByChange={onGroupByChange}
        templateLabels={templateLabels}
      />
    </div>
  );
}

// El número y el porcentaje están en texto; la barra solo los repite a la vista (un solo
// tono sobre su propia pista), así que se oculta al lector de pantalla.
function FunnelStep({
  label,
  count,
  share,
  note,
}: {
  readonly label: string;
  readonly count: number;
  readonly share: number;
  readonly note: string;
}): ReactElement {
  const width = Math.max(0, Math.min(1, Number.isFinite(share) ? share : 0)) * 100;
  return (
    <li className="ui-card space-y-2 p-4">
      <p className="text-muted-foreground text-sm">{label}</p>
      <p className="ui-heading text-3xl tabular-nums">{count}</p>
      <div aria-hidden="true" className="bg-muted h-2 overflow-hidden rounded-full">
        <div className="bg-primary h-full rounded-full" style={{ width: `${width}%` }} />
      </div>
      <p className="text-muted-foreground text-xs">{note}</p>
    </li>
  );
}

function StatTile({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}): ReactElement {
  return (
    <div className="ui-card space-y-1 p-4">
      <p className="text-muted-foreground text-xs sm:text-sm">{label}</p>
      <p className="ui-heading text-xl tabular-nums sm:text-2xl">{value}</p>
    </div>
  );
}

function OutcomesTable({ metrics }: { readonly metrics: DemoMetrics }): ReactElement {
  const { outcomes } = metrics;
  return (
    <section
      aria-labelledby="metrics-outcomes-heading"
      className="ui-card space-y-3 p-4 sm:p-6"
    >
      <h2 id="metrics-outcomes-heading" className="ui-heading text-lg">
        Resultados
      </h2>
      <table className="w-full text-sm">
        <caption className="sr-only">
          Qué pasó con las demos creadas en el período
        </caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Resultado</th>
            <th scope="col">Demos</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {outcomeRows(outcomes).map((row) => (
            <tr key={row.label}>
              <th scope="row" className="py-2 pr-4 text-left font-normal">
                {row.label}
                {row.detail !== undefined && (
                  <span className="text-muted-foreground block text-xs">
                    {row.detail}
                  </span>
                )}
              </th>
              <td className="py-2 text-right font-medium tabular-nums">{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {outcomes.discarded > 0 && (
        <table className="w-full text-sm">
          <caption className="text-muted-foreground pb-1 text-left text-xs font-medium">
            Por qué dijeron que no
          </caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">Motivo</th>
              <th scope="col">Demos</th>
            </tr>
          </thead>
          <tbody>
            {discardReasonRows(outcomes.discardReasons).map((row) => (
              <tr key={row.label}>
                <th
                  scope="row"
                  className="text-muted-foreground py-1 pr-4 pl-3 text-left font-normal"
                >
                  {row.label}
                </th>
                <td className="py-1 text-right tabular-nums">{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {outcomes.purged > 0 && (
        <p className="text-muted-foreground text-xs">
          {outcomes.purged === 1
            ? '1 de ellas ya se borró; sigue contando arriba según lo que le pasó.'
            : `${String(outcomes.purged)} de ellas ya se borraron; siguen contando arriba según lo que les pasó.`}
        </p>
      )}
    </section>
  );
}

const SORT_NEXT: Record<GroupSort, GroupSort> = {
  default: 'conversion-desc',
  'conversion-desc': 'conversion-asc',
  'conversion-asc': 'default',
};

const ARIA_SORT: Record<GroupSort, 'none' | 'descending' | 'ascending'> = {
  default: 'none',
  'conversion-desc': 'descending',
  'conversion-asc': 'ascending',
};

function GroupsTable({
  metrics,
  groupBy,
  onGroupByChange,
  templateLabels,
}: {
  readonly metrics: DemoMetrics;
  readonly groupBy: DemoMetricsGrouping;
  readonly onGroupByChange: (groupBy: DemoMetricsGrouping) => void;
  readonly templateLabels: ReadonlyMap<string, string>;
}): ReactElement {
  const [sort, setSort] = useState<GroupSort>('default');
  const groupName =
    METRICS_GROUPING_OPTIONS.find((option) => option.value === groupBy)?.label ?? 'Grupo';
  const SortIcon =
    sort === 'default' ? ArrowUpDown : sort === 'conversion-desc' ? ArrowDown : ArrowUp;

  return (
    <section
      aria-labelledby="metrics-groups-heading"
      className="ui-card space-y-4 p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="metrics-groups-heading" className="ui-heading text-lg">
          Por {groupName.toLowerCase()}
        </h2>
        <div className="flex items-center gap-2">
          <Label htmlFor="metrics-group-by" className="text-sm">
            Agrupar por
          </Label>
          <select
            id="metrics-group-by"
            className="ui-input h-9 px-2 text-base sm:text-sm"
            value={groupBy}
            onChange={(event) =>
              onGroupByChange(event.target.value as DemoMetricsGrouping)
            }
          >
            {METRICS_GROUPING_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {metrics.groups.length === 0 ? (
        <p className="text-muted-foreground text-sm">No hay grupos que mostrar.</p>
      ) : (
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[18rem] text-sm">
            <caption className="sr-only">
              Embudo de las demos del período por {groupName.toLowerCase()}
            </caption>
            <thead className="text-muted-foreground text-xs">
              <tr className="border-b">
                <th scope="col" className="py-2 pr-3 text-left font-medium">
                  {groupName}
                </th>
                <th scope="col" className="px-2 py-2 text-right font-medium">
                  Creadas
                </th>
                <th scope="col" className="px-2 py-2 text-right font-medium">
                  Abiertas
                </th>
                {/* La conversión va bajo las convertidas, como la apertura bajo las abiertas:
                    cuatro columnas caben en un celular sin desplazarse de lado. */}
                <th
                  scope="col"
                  aria-sort={ARIA_SORT[sort]}
                  className="py-2 pl-2 text-right font-medium"
                >
                  <button
                    type="button"
                    onClick={() => setSort(SORT_NEXT[sort])}
                    className="hover:text-foreground inline-flex items-center gap-1"
                  >
                    Convertidas
                    <span className="sr-only">, ordenar por conversión</span>
                    <SortIcon className="size-3.5" aria-hidden="true" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortGroups(metrics.groups, sort).map((group) => (
                <tr key={group.key ?? 'sin-grupo'}>
                  <th scope="row" className="py-2 pr-3 text-left font-normal">
                    {groupLabel(group, groupBy, templateLabels)}
                  </th>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {group.funnel.created}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums">
                    {group.funnel.opened}
                    <span className="text-muted-foreground block text-xs">
                      {formatRate(group.funnel.openRate)}
                    </span>
                  </td>
                  <td className="py-2 pl-2 text-right tabular-nums">
                    {group.funnel.converted}
                    <span className="block text-xs font-medium">
                      {formatRate(group.funnel.conversionRate)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
