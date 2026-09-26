/** @jest-environment jsdom */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { toast } from 'sonner';
import { DemoActionsPanel, DemoDetail } from './DemoDetail';
import { useAdminApi } from './useAdminApi';
import { AdminApiError } from '../application/AdminApiClient';
import { availableDemoActions } from '../application/demoPresentation';
import type { AdminRole } from '@/modules/Auth/domain/Session';
import { useSession } from '@/modules/Auth/presentation/SessionProvider';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import type { Demo, DemoDetail as DemoDetailData } from '../domain/DemoApi';
import { DEMO_ID, PROSPECT_URL, TENANT_ID, makeDemo, makeDetail } from './demoTestData';

const push = jest.fn();

jest.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
jest.mock('./useAdminApi', () => ({ useAdminApi: jest.fn() }));
jest.mock('@/modules/Auth/presentation/SessionProvider', () => ({
  useSession: jest.fn(),
}));
jest.mock('@/shared/lib/useAsyncData', () => ({
  useAsyncData: jest.fn(),
  refreshAsyncData: jest.fn(),
  revalidateAsyncData: jest.fn(),
}));
jest.mock('sonner', () => ({
  toast: Object.assign(jest.fn(), { success: jest.fn(), error: jest.fn() }),
}));

const noop = (): void => {
  // La prueba solo mira qué botones aparecen.
};

const renderPanel = (demo: Demo, role: AdminRole): void => {
  render(
    <DemoActionsPanel
      demo={demo}
      actions={availableDemoActions(demo, role)}
      pendingAction={null}
      onRegenerate={noop}
      onExtend={noop}
      onToggleExpiry={noop}
      onDiscard={noop}
      onRestore={noop}
      onConvert={noop}
      onDelete={noop}
    />,
  );
};

describe('DemoActionsPanel', () => {
  it('un editor ve las acciones de venta pero no Borrar', () => {
    renderPanel(makeDemo(), 'editor');

    for (const name of [
      'Convertir en cliente',
      'Extender 14 días',
      'Regenerar enlace del prospecto',
      'Regenerar enlace de equipo',
      'Descartar',
    ]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    expect(screen.getByRole('switch', { name: 'Sin vencimiento' })).toHaveAttribute(
      'aria-checked',
      'false',
    );
    expect(screen.getByRole('link', { name: 'Editar sitio' })).toHaveAttribute(
      'href',
      `/clientes/${TENANT_ID}`,
    );
    expect(screen.queryByRole('button', { name: 'Borrar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Recuperar' })).not.toBeInTheDocument();
  });

  it('la dueña además ve Borrar', () => {
    renderPanel(makeDemo(), 'owner');
    expect(screen.getByRole('button', { name: 'Borrar' })).toBeInTheDocument();
  });

  it('una descartada ofrece Recuperar y ya no Descartar ni Convertir', () => {
    renderPanel(makeDemo({ status: 'descartada' }), 'editor');
    expect(screen.getByRole('button', { name: 'Recuperar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Descartar' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Convertir en cliente' }),
    ).not.toBeInTheDocument();
  });

  it('una convertida solo lleva al cliente', () => {
    renderPanel(makeDemo({ status: 'convertida' }), 'owner');
    expect(screen.getByRole('link', { name: 'Abrir cliente' })).toBeInTheDocument();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryByRole('switch')).not.toBeInTheDocument();
  });
});

describe('DemoDetail', () => {
  const api = { get: jest.fn(), post: jest.fn(), patch: jest.fn(), remove: jest.fn() };
  const base = `/api/admin/demos/${DEMO_ID}`;

  const setup = (
    role: AdminRole = 'editor',
    detail: DemoDetailData = makeDetail(),
  ): ReturnType<typeof userEvent.setup> => {
    (useAdminApi as jest.Mock).mockReturnValue(api);
    (useSession as jest.Mock).mockReturnValue({
      session: { token: 't', user: { id: 'u1', name: 'Ana', email: 'a@x.cl', role } },
    });
    (useAsyncData as jest.Mock).mockImplementation((key: string) => ({
      data: key.includes(':visits:')
        ? {
            visits: [
              {
                id: 'v1',
                pageSlug: 'home',
                visitedAt: '2026-09-25T15:30:00.000Z',
                userAgent: 'Mozilla/5.0 (iPhone) Mobile',
              },
            ],
            total: 1,
            page: 1,
            perPage: 20,
          }
        : detail,
      error: null,
      isLoading: false,
    }));
    window.confirm = jest.fn().mockReturnValue(true);
    render(<DemoDetail demoId={DEMO_ID} platformDomain="webbuilder.cl" />);
    return userEvent.setup();
  };

  it('extiende la demo y avisa el resultado', async () => {
    api.post.mockResolvedValue({ demo: makeDemo() });
    const user = setup();

    await user.click(screen.getByRole('button', { name: 'Extender 14 días' }));

    expect(api.post).toHaveBeenCalledWith(`${base}/extend`, undefined, expect.anything());
    expect(toast.success).toHaveBeenCalledWith('Demo extendida 14 días.');
  });

  it('muestra el error de la API con sus palabras', async () => {
    api.post.mockRejectedValue(
      new AdminApiError('Esta demo no vence: primero devuélvele el vencimiento.', 422),
    );
    const user = setup();

    await user.click(screen.getByRole('button', { name: 'Extender 14 días' }));

    expect(toast.error).toHaveBeenCalledWith(
      'Esta demo no vence: primero devuélvele el vencimiento.',
    );
  });

  it('marca la demo sin vencimiento con el interruptor', async () => {
    api.patch.mockResolvedValue({ demo: makeDemo() });
    const user = setup();

    await user.click(screen.getByRole('switch', { name: 'Sin vencimiento' }));

    expect(api.patch).toHaveBeenCalledWith(
      `${base}/expiry`,
      { neverExpires: true },
      expect.anything(),
    );
  });

  it('descarta con el motivo elegido', async () => {
    api.post.mockResolvedValue({ demo: makeDemo({ status: 'descartada' }) });
    const user = setup();

    await user.click(screen.getByRole('button', { name: 'Descartar' }));
    const dialog = screen.getByRole('dialog', { name: 'Descartar la demo' });
    await user.selectOptions(
      within(dialog).getByLabelText('Motivo (opcional)'),
      'precio',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Descartar demo' }));

    expect(api.post).toHaveBeenCalledWith(
      `${base}/discard`,
      { reason: 'precio' },
      expect.anything(),
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('recupera una descartada', async () => {
    api.post.mockResolvedValue({ demo: makeDemo() });
    const user = setup(
      'editor',
      makeDetail({ demo: makeDemo({ status: 'descartada' }) }),
    );

    await user.click(screen.getByRole('button', { name: 'Recuperar' }));

    expect(api.post).toHaveBeenCalledWith(
      `${base}/restore`,
      undefined,
      expect.anything(),
    );
  });

  it('regenera el enlace del prospecto, avisa antes y lo muestra una sola vez', async () => {
    api.post.mockResolvedValue({
      link: { kind: 'prospect', url: PROSPECT_URL, token: 'demo_x' },
    });
    const user = setup();

    await user.click(
      screen.getByRole('button', { name: 'Regenerar enlace del prospecto' }),
    );

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('dejará de funcionar'),
    );
    expect(api.post).toHaveBeenCalledWith(
      `${base}/prospect-link`,
      undefined,
      expect.anything(),
    );
    expect(
      screen.getByRole('heading', { name: 'Nuevo enlace del prospecto' }),
    ).toBeVisible();
    expect(screen.getByText(PROSPECT_URL)).toBeInTheDocument();
    expect(screen.getByText(/no se vuelve a mostrar/)).toBeInTheDocument();
  });

  it('convierte en cliente, explica el descarte de las otras propuestas y muestra la invitación', async () => {
    const sibling = makeDemo({ id: 'd2', status: 'vencida' });
    api.post.mockResolvedValue({
      demo: makeDemo({ status: 'convertida' }),
      tenant: {
        id: TENANT_ID,
        slug: 'pasteleria-luna',
        status: 'active',
        primaryDomain: 'pasteleria-luna.webbuilder.cl',
      },
      removedAddresses: ['demo-pasteleria-luna.webbuilder.cl'],
      discardedDemoIds: ['d2'],
      owner: { id: 'o1', email: 'ana@luna.cl', name: 'Ana Pérez', created: true },
      invitation: { status: 'sent' },
    });
    const user = setup('editor', makeDetail({ otherDemos: [sibling] }));

    await user.click(screen.getByRole('button', { name: 'Convertir en cliente' }));
    const dialog = screen.getByRole('dialog', { name: 'Convertir en cliente' });
    expect(dialog).toHaveTextContent(
      'La otra propuesta abierta de este prospecto se descartará.',
    );
    expect(
      within(dialog).getByLabelText('Dirección definitiva (opcional)'),
    ).toHaveAttribute('placeholder', 'pasteleria-luna');
    await user.type(within(dialog).getByLabelText('Nombre'), 'Ana Pérez');
    await user.type(within(dialog).getByLabelText('Correo'), 'ana@luna.cl');
    await user.click(within(dialog).getByRole('button', { name: 'Convertir' }));

    expect(api.post).toHaveBeenCalledWith(
      `${base}/convert`,
      { owner: { name: 'Ana Pérez', email: 'ana@luna.cl' } },
      expect.anything(),
    );
    const result = screen.getByRole('region', { name: 'Ya es cliente' });
    expect(result).toHaveTextContent('pasteleria-luna.webbuilder.cl');
    expect(result).toHaveTextContent('Le enviamos al dueño un correo');
    expect(result).toHaveTextContent('Se descartó 1 propuesta más');
    expect(
      within(result).getByRole('link', { name: 'Abrir en Clientes' }),
    ).toHaveAttribute('href', `/clientes/${TENANT_ID}`);
  });

  it('al convertir con la dirección ocupada ofrece la sugerencia', async () => {
    api.post.mockRejectedValue(
      new AdminApiError(
        'La dirección ya es de otro sitio.',
        409,
        [],
        'pasteleria-luna-2',
      ),
    );
    const user = setup();

    await user.click(screen.getByRole('button', { name: 'Convertir en cliente' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Convertir' }));
    await user.click(
      within(dialog).getByRole('button', { name: 'Usar «pasteleria-luna-2»' }),
    );

    expect(within(dialog).getByLabelText('Dirección definitiva (opcional)')).toHaveValue(
      'pasteleria-luna-2',
    );
  });

  it('la dueña borra con confirmación y vuelve a la lista', async () => {
    api.remove.mockResolvedValue(undefined);
    const user = setup('owner');

    await user.click(screen.getByRole('button', { name: 'Borrar' }));

    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining('No se puede deshacer'),
    );
    expect(api.remove).toHaveBeenCalledWith(base, { confirm: true });
    expect(push).toHaveBeenCalledWith('/demos');
  });

  it('si no confirma, no borra', async () => {
    const user = setup('owner');
    (window.confirm as jest.Mock).mockReturnValue(false);

    await user.click(screen.getByRole('button', { name: 'Borrar' }));

    expect(api.remove).not.toHaveBeenCalled();
  });

  it('guarda solo lo que cambió de la ficha del prospecto', async () => {
    api.patch.mockResolvedValue({ prospect: {} });
    const user = setup();

    const notes = screen.getByLabelText('Notas (opcional)');
    await user.clear(notes);
    await user.type(notes, 'Le gustó la portada');
    await user.click(screen.getByRole('button', { name: 'Guardar ficha' }));

    expect(api.patch).toHaveBeenCalledWith(
      `${base}/prospect`,
      { notes: 'Le gustó la portada' },
      expect.anything(),
    );
  });

  it('lista las visitas del prospecto con fecha y dispositivo', () => {
    setup(
      'editor',
      makeDetail({
        demo: makeDemo({
          visits: {
            count: 1,
            firstAt: '2026-09-25T15:30:00.000Z',
            lastAt: '2026-09-25T15:30:00.000Z',
          },
        }),
      }),
    );

    const visits = screen.getByRole('region', { name: 'Visitas del prospecto' });
    expect(visits).toHaveTextContent('1 visita');
    expect(within(visits).getByRole('listitem')).toHaveTextContent('Inicio');
    expect(within(visits).getByRole('listitem')).toHaveTextContent('Celular');
  });
});
