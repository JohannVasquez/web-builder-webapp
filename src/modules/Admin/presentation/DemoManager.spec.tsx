/** @jest-environment jsdom */

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DemoCards, DemoManager } from './DemoManager';
import { useAdminApi } from './useAdminApi';
import { useSession } from '@/modules/Auth/presentation/SessionProvider';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import {
  CREATED_DEMO,
  PROSPECT_URL,
  TEAM_URL,
  TEMPLATES,
  daysFromNow,
  makeDemo,
} from './demoTestData';

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

const expiring = makeDemo({
  id: 'd-expiring',
  expiresAt: daysFromNow(2),
  visits: { count: 3, firstAt: daysFromNow(-2), lastAt: daysFromNow(-1) },
});
const converted = makeDemo({
  id: 'd-converted',
  status: 'convertida',
  expiresAt: null,
  neverExpires: true,
  prospect: {
    id: 'p2',
    businessName: 'Taller Andes',
    contactName: null,
    phone: null,
    hasEmail: true,
  },
});

describe('DemoCards', () => {
  it('muestra negocio, rubro, visitas, última visita y quién la creó', () => {
    render(<DemoCards demos={[expiring]} now={new Date()} />);
    const card = screen.getByRole('listitem');

    expect(within(card).getByRole('link', { name: 'Pastelería Luna' })).toHaveAttribute(
      'href',
      '/demos/d-expiring',
    );
    expect(card).toHaveTextContent('Pastelería');
    expect(card).toHaveTextContent('Visitas3');
    expect(card).toHaveTextContent('Creada porAna');
    expect(card).not.toHaveTextContent('Última visitaNunca');
  });

  it('anuncia el estado con texto y no solo con color', () => {
    render(<DemoCards demos={[expiring, converted]} now={new Date()} />);
    const [first, second] = screen.getAllByRole('listitem');

    expect(first).toHaveTextContent('Estado: Por vencer');
    expect(second).toHaveTextContent('Estado: Convertida');
  });

  it('una por vencer deja a mano el teléfono y WhatsApp del prospecto', () => {
    render(<DemoCards demos={[expiring, converted]} now={new Date()} />);

    expect(screen.getByRole('link', { name: /\+56 9 1234 5678/ })).toHaveAttribute(
      'href',
      'tel:+56912345678',
    );
    expect(
      screen.getByRole('link', { name: 'Abrir WhatsApp con Pastelería Luna' }),
    ).toHaveAttribute('href', 'https://wa.me/56912345678');
    expect(screen.getByText(/Sin correo/)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /WhatsApp/ })).toHaveLength(1);
  });

  it('sin demos lo dice', () => {
    render(<DemoCards demos={[]} now={new Date()} />);
    expect(screen.getByText('No hay demos con estos filtros.')).toBeInTheDocument();
  });
});

describe('DemoManager', () => {
  const api = { get: jest.fn(), post: jest.fn() };

  beforeEach(() => {
    (useAdminApi as jest.Mock).mockReturnValue(api);
    (useSession as jest.Mock).mockReturnValue({
      session: {
        token: 't',
        user: { id: 'u1', name: 'Ana', email: 'a@x.cl', role: 'editor' },
      },
    });
    (useAsyncData as jest.Mock).mockImplementation((key: string) => ({
      data: key.startsWith('admin:demos:') ? [expiring, converted] : TEMPLATES,
      error: null,
      isLoading: false,
    }));
  });

  const lastListKey = (): string =>
    (useAsyncData as jest.Mock).mock.calls
      .map(([key]: [string]) => key)
      .filter((key) => key.startsWith('admin:demos:'))
      .at(-1) ?? '';

  it('filtra por estado (incluido por vencer) y por "creadas por mí" en la API', async () => {
    const user = userEvent.setup();
    render(<DemoManager platformDomain="webbuilder.cl" />);
    expect(lastListKey()).toBe('admin:demos:/api/admin/demos');

    await user.click(screen.getByRole('button', { name: 'Por vencer' }));
    expect(screen.getByRole('button', { name: 'Por vencer' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(lastListKey()).toBe('admin:demos:/api/admin/demos?status=por-vencer');

    await user.click(screen.getByLabelText('Creadas por mí'));
    expect(lastListKey()).toBe(
      'admin:demos:/api/admin/demos?status=por-vencer&createdBy=u1',
    );
  });

  it('busca por negocio', async () => {
    const user = userEvent.setup();
    render(<DemoManager platformDomain="webbuilder.cl" />);

    await user.type(screen.getByLabelText('Buscar por negocio'), 'taller');

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Taller Andes' })).toBeInTheDocument();
  });

  it('crea una demo desde un kit y muestra los dos enlaces una sola vez', async () => {
    const user = userEvent.setup();
    api.post.mockResolvedValue(CREATED_DEMO);
    render(<DemoManager platformDomain="webbuilder.cl" />);

    await user.click(screen.getByRole('button', { name: 'Nueva demo' }));
    await user.type(screen.getByLabelText('Negocio'), 'Pastelería Luna');
    await user.selectOptions(screen.getByLabelText('Kit por rubro'), 'pasteleria');
    await user.click(screen.getByRole('button', { name: 'Crear demo' }));

    expect(screen.queryByRole('button', { name: 'Crear demo' })).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Demo lista: Pastelería Luna' }),
    ).toBeVisible();
    expect(screen.getByText(PROSPECT_URL)).toBeInTheDocument();
    expect(screen.getByText(TEAM_URL)).toBeInTheDocument();
    expect(screen.getByText(/no se vuelve a mostrar/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Enviar por WhatsApp/ })).toHaveAttribute(
      'href',
      expect.stringContaining('https://wa.me/56912345678?text='),
    );
    expect(screen.getByRole('link', { name: /Abrir la ficha/ })).toHaveAttribute(
      'href',
      `/demos/${CREATED_DEMO.demo.id}`,
    );
  });
});
