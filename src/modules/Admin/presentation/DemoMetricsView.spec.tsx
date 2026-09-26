/** @jest-environment jsdom */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DemoMetricsReport, DemoMetricsView } from './DemoMetricsView';
import { DemoManager } from './DemoManager';
import { useAdminApi } from './useAdminApi';
import { useSession } from '@/modules/Auth/presentation/SessionProvider';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import type { AdminRole } from '@/modules/Auth/domain/Session';
import type { DemoFunnel, DemoMetrics } from '../domain/DemoApi';

jest.mock('./useAdminApi', () => ({ useAdminApi: jest.fn() }));
jest.mock('@/modules/Auth/presentation/SessionProvider', () => ({
  useSession: jest.fn(),
}));
jest.mock('@/shared/lib/useAsyncData', () => ({
  useAsyncData: jest.fn(),
  refreshAsyncData: jest.fn(),
  revalidateAsyncData: jest.fn(),
}));

const funnel = (overrides: Partial<DemoFunnel> = {}): DemoFunnel => ({
  created: 5,
  opened: 3,
  converted: 1,
  openRate: 0.6,
  conversionRate: 0.2,
  conversionRateOfOpened: 0.3333,
  ...overrides,
});

// La respuesta de ejemplo de `web-builder-api/docs/demos.md`, sección Métricas.
const METRICS: DemoMetrics = {
  range: { from: '2026-06-29', to: '2026-09-26', timeZone: 'America/Santiago' },
  asOf: '2026-09-26T15:00:00.000Z',
  funnel: funnel(),
  outcomes: {
    active: 1,
    expired: 1,
    discarded: 1,
    discardReasons: {
      'no-interesado': 0,
      precio: 1,
      'ya-tiene-sitio': 0,
      'no-responde': 0,
      otro: 0,
      'sin-motivo': 0,
    },
    otraPropuesta: 1,
    converted: 1,
    purged: 2,
  },
  timing: { medianDaysToFirstVisit: 1, medianDaysToConversion: 7.04 },
  engagement: { avgVisitsPerOpenedDemo: 3.33, avgExtensions: 0.4 },
  groupBy: 'industry',
  groups: [
    {
      key: 'pastelería',
      label: 'pastelería',
      funnel: funnel({
        created: 3,
        opened: 2,
        converted: 0,
        openRate: 0.6667,
        conversionRate: 0,
        conversionRateOfOpened: 0,
      }),
    },
    {
      key: 'spa',
      label: 'spa',
      funnel: funnel({
        created: 1,
        opened: 1,
        converted: 1,
        openRate: 1,
        conversionRate: 1,
        conversionRateOfOpened: 1,
      }),
    },
    {
      key: null,
      label: 'Sin rubro',
      funnel: funnel({
        created: 1,
        opened: 0,
        converted: 0,
        openRate: 0,
        conversionRate: 0,
        conversionRateOfOpened: 0,
      }),
    },
  ],
};

const EMPTY: DemoMetrics = {
  ...METRICS,
  funnel: funnel({
    created: 0,
    opened: 0,
    converted: 0,
    openRate: 0,
    conversionRate: 0,
    conversionRateOfOpened: 0,
  }),
  outcomes: {
    active: 0,
    expired: 0,
    discarded: 0,
    discardReasons: {
      'no-interesado': 0,
      precio: 0,
      'ya-tiene-sitio': 0,
      'no-responde': 0,
      otro: 0,
      'sin-motivo': 0,
    },
    otraPropuesta: 0,
    converted: 0,
    purged: 0,
  },
  timing: { medianDaysToFirstVisit: null, medianDaysToConversion: null },
  engagement: { avgVisitsPerOpenedDemo: 0, avgExtensions: 0 },
  groups: [],
};

const renderReport = (metrics: DemoMetrics): void => {
  render(
    <DemoMetricsReport
      metrics={metrics}
      groupBy="industry"
      onGroupByChange={jest.fn()}
      templateLabels={new Map()}
    />,
  );
};

describe('DemoMetricsReport', () => {
  it('muestra el embudo con números y porcentajes de la API', () => {
    renderReport(METRICS);
    const steps = within(screen.getByRole('region', { name: 'Embudo' })).getAllByRole(
      'listitem',
    );

    expect(steps[0]).toHaveTextContent('Creadas5');
    expect(steps[1]).toHaveTextContent(
      /Abiertas por el prospecto3\s*60\s?% de las creadas/,
    );
    expect(steps[2]).toHaveTextContent(/Convertidas en cliente1/);
    expect(steps[2]).toHaveTextContent(
      /20\s?% de las creadas · 33,3\s?% de las abiertas/,
    );
  });

  it('muestra las tarjetas de tasas y medianas', () => {
    renderReport(METRICS);
    const tiles = screen.getByRole('region', { name: 'Indicadores' });

    expect(tiles).toHaveTextContent(/Tasa de apertura60\s?%/);
    expect(tiles).toHaveTextContent(/Tasa de conversión20\s?%/);
    expect(tiles).toHaveTextContent('Mediana hasta la primera visita1 día');
    expect(tiles).toHaveTextContent('Mediana hasta la conversión7 días');
  });

  it('desglosa los resultados y los motivos de descarte', () => {
    renderReport(METRICS);
    const outcomes = screen.getByRole('region', { name: 'Resultados' });

    expect(within(outcomes).getByRole('row', { name: /Vigentes 1/ })).toBeInTheDocument();
    expect(
      within(outcomes).getByRole('row', { name: /Descartadas por otra propuesta/ }),
    ).toHaveTextContent('1');
    expect(
      within(outcomes).getByRole('row', { name: 'Por el precio 1' }),
    ).toBeInTheDocument();
    expect(outcomes).toHaveTextContent('2 de ellas ya se borraron');
  });

  it('ordena la tabla por conversión con el grupo sin rubro al final', async () => {
    const user = userEvent.setup();
    renderReport(METRICS);
    const table = within(screen.getByRole('region', { name: 'Por rubro' })).getByRole(
      'table',
    );
    const firstColumn = (): string[] =>
      within(table)
        .getAllByRole('rowheader')
        .map((cell) => cell.textContent ?? '');

    expect(firstColumn()).toEqual(['pastelería', 'spa', 'Sin rubro']);
    await user.click(within(table).getByRole('button', { name: /Conversión/ }));
    expect(firstColumn()).toEqual(['spa', 'pastelería', 'Sin rubro']);
    expect(
      within(table).getByRole('columnheader', { name: /Conversión/ }),
    ).toHaveAttribute('aria-sort', 'descending');
  });

  it('un período sin demos muestra el estado vacío, sin NaN', () => {
    renderReport(EMPTY);

    expect(screen.getByText('Todavía no hay demos en este período.')).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent('NaN');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

describe('DemoMetricsView', () => {
  const setup = (role: AdminRole, data: DemoMetrics | null = METRICS): void => {
    (useAdminApi as jest.Mock).mockReturnValue({ get: jest.fn() });
    (useSession as jest.Mock).mockReturnValue({
      session: { token: 't', user: { id: 'u1', name: 'Ana', email: 'a@x.cl', role } },
    });
    (useAsyncData as jest.Mock).mockImplementation((key: string) => ({
      data: key.startsWith('admin:demos:metrics:') ? data : [],
      error: null,
      isLoading: data === null,
    }));
  };

  const lastMetricsKey = (): string =>
    (useAsyncData as jest.Mock).mock.calls
      .map(([key]: [string]) => key)
      .filter((key) => key.startsWith('admin:demos:metrics:'))
      .at(-1) ?? '';

  it('pide los últimos 30 días agrupados por rubro y cambia de rango y agrupación', async () => {
    const user = userEvent.setup();
    setup('owner');
    render(<DemoMetricsView />);

    expect(lastMetricsKey()).toMatch(
      /from=\d{4}-\d{2}-\d{2}&to=\d{4}-\d{2}-\d{2}&groupBy=industry$/,
    );

    await user.click(screen.getByRole('button', { name: 'Este año' }));
    expect(lastMetricsKey()).toMatch(/from=\d{4}-01-01&/);

    await user.selectOptions(screen.getByLabelText('Agrupar por'), 'creator');
    expect(lastMetricsKey()).toMatch(/groupBy=creator$/);
  });

  it('un rango personalizado incompleto no se pide y lo explica', async () => {
    const user = userEvent.setup();
    setup('owner');
    render(<DemoMetricsView />);

    await user.click(screen.getByRole('button', { name: 'Personalizado' }));
    const validKey = lastMetricsKey();
    await user.clear(screen.getByLabelText('Desde'));

    expect(screen.getByRole('alert')).toHaveTextContent('Elige la fecha de inicio');
    expect(lastMetricsKey()).toBe(validKey);
  });

  it('la dueña ve las pestañas Demos y Métricas', () => {
    setup('owner');
    render(<DemoMetricsView />);

    expect(screen.getByRole('link', { name: 'Métricas' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Demos' })).toHaveAttribute('href', '/demos');
  });
});

describe('pestaña de métricas en la lista de demos', () => {
  it.each<[AdminRole, boolean]>([
    ['owner', true],
    ['editor', false],
  ])('%s ve la pestaña Métricas: %s', (role, visible) => {
    (useAdminApi as jest.Mock).mockReturnValue({ get: jest.fn() });
    (useSession as jest.Mock).mockReturnValue({
      session: { token: 't', user: { id: 'u1', name: 'Ana', email: 'a@x.cl', role } },
    });
    (useAsyncData as jest.Mock).mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
    });

    render(<DemoManager platformDomain="webbuilder.cl" />);

    expect(screen.queryByRole('link', { name: 'Métricas' }) !== null).toBe(visible);
  });
});
