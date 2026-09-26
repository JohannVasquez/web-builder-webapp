/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataRightsRequests } from './DataRightsRequests';
import { useAdminApi } from './useAdminApi';
import { useAsyncData } from '@/shared/lib/useAsyncData';
import '@testing-library/jest-dom';

jest.mock('./useAdminApi', () => ({ useAdminApi: jest.fn() }));

jest.mock('@/shared/lib/useAsyncData', () => ({
  useAsyncData: jest.fn(),
  refreshAsyncData: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('DataRightsRequests', () => {
  const tenantId = 'tenant-123';
  const mockApi = {
    patch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAdminApi as jest.Mock).mockReturnValue(mockApi);
    window.confirm = jest.fn();
  });

  it('lista las solicitudes y marca las vencidas sin depender solo del color', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    (useAsyncData as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        requests: [
          {
            id: 'req-1',
            right: 'acceso',
            email: 'test@example.com',
            status: 'pendiente',
            createdAt: new Date().toISOString(),
            dueAt: futureDate.toISOString(),
            details: '',
          },
          {
            id: 'req-2',
            right: 'cancelacion',
            email: 'overdue@example.com',
            status: 'verificada',
            createdAt: new Date().toISOString(),
            dueAt: pastDate.toISOString(),
            details: '',
          },
        ],
      },
    });

    render(<DataRightsRequests tenantId={tenantId} />);

    expect(screen.getByText('Acceso')).toBeInTheDocument();
    expect(screen.getByText('Pendiente de verificación')).toBeInTheDocument();

    expect(screen.getByText('Cancelación')).toBeInTheDocument();
    expect(screen.getByText('En revisión (confirmada)')).toBeInTheDocument();

    // La solicitud vencida tiene una marca perceptible (texto oculto pero accesible)
    expect(screen.getByText('Vencida')).toBeInTheDocument();
    expect(screen.getByText('Atención:')).toHaveClass('sr-only');
  });

  it('pide confirmación al resolver una cancelación', async () => {
    const user = userEvent.setup();
    (useAsyncData as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      data: {
        requests: [
          {
            id: 'req-3',
            right: 'cancelacion',
            email: 'test@example.com',
            status: 'verificada', // Pendiente de acción
            createdAt: new Date().toISOString(),
            dueAt: new Date(Date.now() + 100000).toISOString(),
            details: '',
          },
        ],
      },
    });

    render(<DataRightsRequests tenantId={tenantId} />);

    // Abrir detalles
    await user.click(screen.getByRole('button', { name: /Ver detalles/i }));

    const resolveBtn = screen.getByRole('button', { name: /Marcar como resuelta/i });

    // Cancelar la confirmación
    (window.confirm as jest.Mock).mockReturnValue(false);
    await user.click(resolveBtn);
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('irreversible'));
    expect(mockApi.patch).not.toHaveBeenCalled();

    // Aceptar la confirmación
    (window.confirm as jest.Mock).mockReturnValue(true);
    await user.click(resolveBtn);
    expect(mockApi.patch).toHaveBeenCalledWith(
      `/api/admin/tenants/${tenantId}/solicitudes-datos/req-3`,
      { outcome: 'resuelta' },
      expect.anything()
    );
  });
});
