/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { usePathname } from 'next/navigation';
import { AdminShell } from './AdminShell';
import type { AdminRole } from '@/modules/Auth/domain/Session';
import { useSession } from '@/modules/Auth/presentation/SessionProvider';

jest.mock('next/navigation', () => ({ usePathname: jest.fn() }));
jest.mock('@/modules/Auth/presentation/SessionProvider', () => ({
  useSession: jest.fn(),
}));
jest.mock('./LoginForm', () => ({ LoginForm: () => null }));

const renderAs = (role: AdminRole, pathname: string): void => {
  (usePathname as jest.Mock).mockReturnValue(pathname);
  (useSession as jest.Mock).mockReturnValue({
    session: { token: 't', user: { id: 'u1', name: 'Ana', email: 'a@x.cl', role } },
    isLoading: false,
    signOut: jest.fn(),
  });
  render(
    <AdminShell>
      <p>Contenido de la pantalla</p>
    </AdminShell>,
  );
};

describe('AdminShell: sección Demos por rol', () => {
  it.each<AdminRole>(['owner', 'editor'])('%s ve Demos en el menú y entra', (role) => {
    renderAs(role, '/demos');

    expect(screen.getByRole('link', { name: 'Demos' })).toHaveAttribute('href', '/demos');
    expect(screen.getByText('Contenido de la pantalla')).toBeInTheDocument();
  });

  it('la ficha de una demo sigue marcando Demos en el menú', () => {
    renderAs('editor', '/demos/018f6f1a-0000-7000-8000-000000000001');

    expect(screen.getByRole('link', { name: 'Demos' })).toHaveClass('bg-accent');
    expect(screen.getByRole('link', { name: 'Clientes' })).not.toHaveClass('bg-accent');
  });

  it('un usuario cliente no ve Demos en el menú', () => {
    renderAs('client', '/');

    expect(screen.queryByRole('link', { name: 'Demos' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Clientes' })).toBeInTheDocument();
  });

  it.each(['/demos', '/demos/018f6f1a-0000-7000-8000-000000000001'])(
    'un usuario cliente que escribe %s ve el aviso y no la pantalla',
    (pathname) => {
      renderAs('client', pathname);

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Esta sección es solo para el equipo de la agencia.',
      );
      expect(screen.queryByText('Contenido de la pantalla')).not.toBeInTheDocument();
    },
  );
});
