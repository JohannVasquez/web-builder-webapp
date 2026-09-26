/** @jest-environment jsdom */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TenantSubscriptionDetail } from './TenantSubscriptionDetail';
import { useAdminApi } from './useAdminApi';
import { useAsyncData } from '@/shared/lib/useAsyncData';

jest.mock('./useAdminApi');
jest.mock('@/shared/lib/useAsyncData');
jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() }
}));

describe('TenantSubscriptionDetail', () => {
  it('registra un pago llamando a la ruta correcta', async () => {
    (useAsyncData as jest.Mock).mockReturnValue({
      data: {
        planName: 'Básico',
        priceCents: 30000,
        status: 'atrasado',
      },
      isLoading: false,
      error: null,
    });

    const postMock = jest.fn().mockResolvedValue({});
    (useAdminApi as jest.Mock).mockReturnValue({
      post: postMock,
    });

    const user = userEvent.setup();
    render(<TenantSubscriptionDetail tenantId="tenant-123" />);

    await user.type(screen.getByLabelText(/Monto/i), '30000');
    await user.type(screen.getByLabelText(/Fecha/i), '2023-01-01');
    await user.type(screen.getByLabelText(/Medio/i), 'Transferencia');

    await user.click(screen.getByRole('button', { name: /Registrar pago/i }));

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledWith(
        '/api/admin/tenants/tenant-123/subscription/payments',
        expect.objectContaining({
          amountCents: 30000,
          paymentMethod: 'Transferencia',
        }),
        expect.anything()
      );
    });
  });
});
