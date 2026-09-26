import {
  buildMetricsPath,
  discardReasonRows,
  formatMedianDays,
  formatRate,
  groupLabel,
  isEmptyPeriod,
  outcomeRows,
  rangeForPreset,
  sortGroups,
  todayInChile,
  validateCustomRange,
} from './demoMetrics';
import type { DemoFunnel, DemoMetrics, DemoMetricsGroup } from '../domain/DemoApi';

const funnel = (created: number, converted: number): DemoFunnel => ({
  created,
  opened: created,
  converted,
  openRate: created === 0 ? 0 : 1,
  conversionRate: created === 0 ? 0 : converted / created,
  conversionRateOfOpened: created === 0 ? 0 : converted / created,
});

const group = (
  key: string | null,
  created: number,
  converted: number,
): DemoMetricsGroup => ({
  key,
  label: key ?? 'Sin rubro',
  funnel: funnel(created, converted),
});

describe('todayInChile', () => {
  it('usa el día de Chile, no el de UTC', () => {
    // 02:00 UTC del 27 son las 23:00 del 26 en Chile (UTC-3 en septiembre).
    expect(todayInChile(new Date('2026-09-27T02:00:00.000Z'))).toBe('2026-09-26');
  });
});

describe('rangeForPreset', () => {
  it('los últimos 30 y 90 días incluyen hoy', () => {
    expect(rangeForPreset('last-30', '2026-09-26')).toEqual({
      from: '2026-08-28',
      to: '2026-09-26',
    });
    expect(rangeForPreset('last-90', '2026-09-26')).toEqual({
      from: '2026-06-29',
      to: '2026-09-26',
    });
  });

  it('este año va del 1 de enero a hoy', () => {
    expect(rangeForPreset('this-year', '2026-09-26')).toEqual({
      from: '2026-01-01',
      to: '2026-09-26',
    });
  });
});

describe('validateCustomRange', () => {
  it('acepta un rango completo y en orden', () => {
    expect(validateCustomRange({ from: '2026-01-01', to: '2026-01-31' })).toBeNull();
    expect(validateCustomRange({ from: '2026-01-01', to: '2026-01-01' })).toBeNull();
  });

  it('rechaza fechas vacías o al revés', () => {
    expect(validateCustomRange({ from: '', to: '2026-01-31' })).not.toBeNull();
    expect(validateCustomRange({ from: '2026-02-01', to: '2026-01-31' })).toMatch(
      /anterior/,
    );
  });
});

describe('buildMetricsPath', () => {
  it('manda el rango y la agrupación', () => {
    expect(buildMetricsPath({ from: '2026-01-01', to: '2026-01-31' }, 'creator')).toBe(
      '/api/admin/demos/metrics?from=2026-01-01&to=2026-01-31&groupBy=creator',
    );
  });
});

describe('formatos', () => {
  it('las tasas van en porcentaje chileno y nunca NaN', () => {
    expect(formatRate(0.3333)).toMatch(/^33,3\s?%$/);
    expect(formatRate(1)).toMatch(/^100\s?%$/);
    expect(formatRate(0)).toMatch(/^0\s?%$/);
    expect(formatRate(Number.NaN)).toMatch(/^0\s?%$/);
  });

  it('una mediana nula dice "Sin datos"', () => {
    expect(formatMedianDays(null)).toBe('Sin datos');
    expect(formatMedianDays(1)).toBe('1 día');
    expect(formatMedianDays(7.04)).toBe('7 días');
    expect(formatMedianDays(2.46)).toBe('2,5 días');
  });
});

describe('groupLabel', () => {
  const noTemplates = new Map<string, string>();

  it('nombra el mes en español', () => {
    expect(groupLabel(group('2026-09', 1, 0), 'month', noTemplates)).toBe(
      'septiembre de 2026',
    );
  });

  it('usa el nombre del kit cuando se conoce', () => {
    expect(
      groupLabel(
        group('pasteleria', 1, 0),
        'template',
        new Map([['pasteleria', 'Pastelería']]),
      ),
    ).toBe('Pastelería');
    expect(groupLabel(group('otro-kit', 1, 0), 'template', noTemplates)).toBe('otro-kit');
  });

  it('el grupo sin clave usa la etiqueta de la API', () => {
    expect(groupLabel(group(null, 1, 0), 'industry', noTemplates)).toBe('Sin rubro');
  });
});

describe('sortGroups', () => {
  const groups = [
    group('a', 4, 1),
    group('b', 2, 2),
    group('c', 5, 0),
    group(null, 3, 3),
  ];

  it('sin orden deja el de la API', () => {
    expect(sortGroups(groups, 'default')).toBe(groups);
  });

  it('ordena por conversión y deja el grupo sin clave al final', () => {
    expect(sortGroups(groups, 'conversion-desc').map((g) => g.key)).toEqual([
      'b',
      'a',
      'c',
      null,
    ]);
    expect(sortGroups(groups, 'conversion-asc').map((g) => g.key)).toEqual([
      'c',
      'a',
      'b',
      null,
    ]);
  });
});

describe('resultados', () => {
  const outcomes: DemoMetrics['outcomes'] = {
    active: 1,
    expired: 1,
    discarded: 2,
    discardReasons: {
      'no-interesado': 0,
      precio: 1,
      'ya-tiene-sitio': 0,
      'no-responde': 0,
      otro: 0,
      'sin-motivo': 1,
    },
    otraPropuesta: 1,
    converted: 1,
    purged: 2,
  };

  it('las filas de resultados suman las creadas', () => {
    const total = outcomeRows(outcomes).reduce((sum, row) => sum + row.count, 0);
    expect(total).toBe(6);
  });

  it('desglosa cada motivo de descarte, también sin motivo', () => {
    expect(discardReasonRows(outcomes.discardReasons)).toEqual([
      { label: 'No le interesa', count: 0 },
      { label: 'Por el precio', count: 1 },
      { label: 'Ya tiene sitio', count: 0 },
      { label: 'No responde', count: 0 },
      { label: 'Otro motivo', count: 0 },
      { label: 'Sin motivo', count: 1 },
    ]);
  });

  it('un período sin demos creadas está vacío', () => {
    expect(isEmptyPeriod({ funnel: funnel(0, 0) } as DemoMetrics)).toBe(true);
    expect(isEmptyPeriod({ funnel: funnel(1, 0) } as DemoMetrics)).toBe(false);
  });
});
