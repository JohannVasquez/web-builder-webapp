/** @jest-environment jsdom */

import { act, render, screen } from '@testing-library/react';

import { SiteQualityReviewPanel } from './SiteQualityReviewPanel';
import { useAdminApi } from './useAdminApi';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import '@testing-library/jest-dom';

jest.mock('./useAdminApi', () => ({ useAdminApi: jest.fn() }));

jest.mock('@/shared/lib/useAsyncData', () => ({
  useAsyncData: jest.fn(),
  refreshAsyncData: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

const tenantId = 'tenant-42';

// Página publicada mínima para no repetir boilerplate en cada test.
const publishedPage = {
  id: 'p1',
  slug: 'home',
  title: 'Inicio',
  description: null,
  isPublished: true,
  visualStyle: null,
  sections: [],
};

// Despacha según la clave de caché, no según el orden de llamada: estable ante cualquier
// cantidad de re-renders porque no depende de un contador de llamadas interno.
function mockBothSources(
  reviewObservations: unknown[],
  pages: unknown[] = [publishedPage],
): void {
  (useAsyncData as jest.Mock).mockImplementation((key: string) => {
    if (key.includes(':quality-review:')) {
      return { isLoading: false, error: null, data: { observations: reviewObservations } };
    }
    // Cualquier otra clave (incluyendo :pages) devuelve el listado de páginas.
    return { isLoading: false, error: null, data: pages };
  });
}

describe('SiteQualityReviewPanel — sitio sin observaciones', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAdminApi as jest.Mock).mockReturnValue({ get: jest.fn() });
  });

  it('muestra el mensaje de listo cuando no hay ninguna observación', () => {
    mockBothSources([]);
    render(<SiteQualityReviewPanel tenantId={tenantId} />);
    expect(screen.getByText(/listo para entregar/i)).toBeInTheDocument();
  });

  it('el mensaje de listo tiene rol accesible', () => {
    mockBothSources([]);
    render(<SiteQualityReviewPanel tenantId={tenantId} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('SiteQualityReviewPanel — lista de observaciones de las dos fuentes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAdminApi as jest.Mock).mockReturnValue({ get: jest.fn() });
  });

  it('muestra observaciones que vienen de la API y observaciones del cliente en una sola lista', () => {
    const apiObs = [
      {
        what: 'Página sin meta descripción',
        where: 'Página "Inicio"',
        severity: 'blocking',
        fix: 'Agrega una descripción de entre 120 y 160 caracteres.',
      },
    ];
    // Una galería con 21 imágenes disparará reviewRenderingQuality.
    const pages = [
      {
        ...publishedPage,
        sections: [
          {
            id: 'g1',
            type: 'Gallery',
            position: 1,
            props: {
              images: Array.from({ length: 21 }, (_, i) => ({
                url: `https://x.com/${i}.jpg`,
                alt: '',
              })),
            },
            anchor: null,
            isHidden: false,
          },
        ],
      },
    ];

    mockBothSources(apiObs, pages);
    render(<SiteQualityReviewPanel tenantId={tenantId} />);

    // Observación de la API
    expect(screen.getByText(/sin meta descripción/i)).toBeInTheDocument();
    // Observación del cliente (reviewRenderingQuality detecta la galería)
    expect(screen.getByText(/21 imágenes/i)).toBeInTheDocument();
  });

  it('el conteo de observaciones es la suma de ambas fuentes', () => {
    const apiObs = [
      { what: 'Obs API', where: 'Sitio', severity: 'blocking', fix: 'Corrígela.' },
    ];
    const pages = [
      {
        ...publishedPage,
        sections: [
          {
            id: 'g1',
            type: 'Gallery',
            position: 1,
            props: {
              images: Array.from({ length: 21 }, (_, i) => ({
                url: `https://x.com/${i}.jpg`,
                alt: '',
              })),
            },
            anchor: null,
            isHidden: false,
          },
        ],
      },
    ];

    mockBothSources(apiObs, pages);
    render(<SiteQualityReviewPanel tenantId={tenantId} />);

    // La API devuelve 1 observación bloqueante + el cliente detecta 1 mejorable = 2 en total.
    expect(screen.getByText(/2 observaciones encontradas/i)).toBeInTheDocument();
  });
});

describe('SiteQualityReviewPanel — gravedad sin depender del color', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAdminApi as jest.Mock).mockReturnValue({ get: jest.fn() });
  });

  it('las observaciones bloqueantes tienen aria-label con la palabra "bloqueante"', () => {
    const apiObs = [
      {
        what: 'Sin título SEO',
        where: 'Página "Inicio"',
        severity: 'blocking',
        fix: 'Agrega un título.',
      },
    ];

    mockBothSources(apiObs);
    render(<SiteQualityReviewPanel tenantId={tenantId} />);

    const item = screen.getByRole('listitem', { name: /bloqueante/i });
    expect(item).toBeInTheDocument();
  });

  it('las observaciones mejorables tienen aria-label con la palabra "mejorable"', () => {
    const apiObs = [
      {
        what: 'Galería grande',
        where: 'Página "Inicio"',
        severity: 'improvable',
        fix: 'Reduce imágenes.',
      },
    ];

    mockBothSources(apiObs);
    render(<SiteQualityReviewPanel tenantId={tenantId} />);

    const item = screen.getByRole('listitem', { name: /mejorable/i });
    expect(item).toBeInTheDocument();
  });

  it('el texto sr-only de las bloqueantes aclara que impiden la entrega', () => {
    const apiObs = [
      {
        what: 'Sin título SEO',
        where: 'Página "Inicio"',
        severity: 'blocking',
        fix: 'Agrega un título.',
      },
    ];

    mockBothSources(apiObs);
    render(<SiteQualityReviewPanel tenantId={tenantId} />);

    const srText = screen.getByText(/impide entregar el sitio/i);
    expect(srText).toHaveClass('sr-only');
  });

  it('las observaciones bloqueantes aparecen en una sección distinta de las mejorables', () => {
    const apiObs = [
      { what: 'Error grave', where: 'Sitio', severity: 'blocking', fix: 'Corrige.' },
      { what: 'Optimización', where: 'Sitio', severity: 'improvable', fix: 'Mejora.' },
    ];

    mockBothSources(apiObs);
    render(<SiteQualityReviewPanel tenantId={tenantId} />);

    // Hay dos encabezados de sección distintos
    expect(screen.getByRole('heading', { name: /impiden entregar/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /mejorables/i })).toBeInTheDocument();
  });
});

describe('SiteQualityReviewPanel — botón de re-ejecución', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAdminApi as jest.Mock).mockReturnValue({ get: jest.fn() });
  });

  it('muestra el botón "Correr revisión de nuevo" cuando ya hay resultados', () => {
    mockBothSources([]);
    render(<SiteQualityReviewPanel tenantId={tenantId} />);
    expect(screen.getByRole('button', { name: /correr revisión de nuevo/i })).toBeInTheDocument();
  });

  it('el botón de re-ejecución no está deshabilitado cuando la revisión está lista', () => {
    mockBothSources([]);
    render(<SiteQualityReviewPanel tenantId={tenantId} />);
    const btn = screen.getByRole('button', { name: /correr revisión de nuevo/i });
    expect(btn).not.toBeDisabled();
  });

  it('al pulsar "Correr revisión de nuevo" se vuelve a pedir la revisión con una clave nueva', () => {
    mockBothSources([]);
    const { rerender } = render(<SiteQualityReviewPanel tenantId={tenantId} />);

    // Render inicial: solo se usó la clave :0
    const keysBeforeClick = (useAsyncData as jest.Mock).mock.calls
      .map(([key]: [string]) => key)
      .filter((key) => key.includes(':quality-review:'));

    expect(keysBeforeClick).toHaveLength(1);
    expect(keysBeforeClick[0]).toContain(':quality-review:0');

    // Pulsar el botón incrementa runCount → la clave pasa a :1
    act(() => {
      screen.getByRole('button', { name: /correr revisión de nuevo/i }).click();
    });

    // rerender para que el componente refleje el estado actualizado en el mock.
    rerender(<SiteQualityReviewPanel tenantId={tenantId} />);

    const keysAfterClick = (useAsyncData as jest.Mock).mock.calls
      .map(([key]: [string]) => key)
      .filter((key) => key.includes(':quality-review:'));

    // El componente debió pedir la revisión con la clave incrementada.
    expect(keysAfterClick.some((key) => key.includes(':quality-review:1'))).toBe(true);
  });
});
