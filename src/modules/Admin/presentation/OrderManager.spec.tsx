/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrderManager } from './OrderManager';
import { useAdminApi } from './useAdminApi';
import { toast } from 'sonner';

jest.mock('./useAdminApi', () => ({ useAdminApi: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const baseOrder = {
  id: '018f6f1a-0000-7000-8000-000000000001',
  number: 'ORD-001',
  status: 'pending',
  statusLabel: 'Pendiente',
  customer: { name: 'Juan Pérez', email: 'juan@example.com', phone: '+56912345678' },
  delivery: {
    method: 'shipping',
    shippingName: 'Despacho normal',
    addressLine: 'Calle Falsa 123',
    addressCity: 'Santiago',
    addressRegion: 'RM',
    addressNotes: null,
  },
  items: [],
  subtotalCents: 15000,
  discountCents: 0,
  shippingCents: 3000,
  taxCents: 2874,
  totalCents: 18000,
  currency: 'CLP',
  couponCode: null,
  paymentProvider: 'flow',
  paidAt: null,
  createdAt: '2026-09-22T04:00:00Z',
  termsAcceptedAt: null,
  termsVersion: null,
  confirmationEmailError: null,
};

describe('OrderManager reintento de correo', () => {
  let mockApi: { get: jest.Mock; post: jest.Mock; patch: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    mockApi = {
      get: jest.fn().mockResolvedValue({
        orders: [
          baseOrder, // Sin error
          { ...baseOrder, id: 'ord-err', number: 'ORD-002', confirmationEmailError: 'SMTP devuelto' },
        ],
        total: 2,
        page: 1,
        perPage: 20,
      }),
      post: jest.fn(),
      patch: jest.fn(),
    };
    (useAdminApi as jest.Mock).mockReturnValue(mockApi);
  });

  it('un pedido con correo fallido se marca de forma perceptible y ofrece la acción', async () => {
    render(<OrderManager tenantId="tenant-123" />);

    // Esperar a que carguen los pedidos
    expect(await screen.findByText('Pedido #ORD-001')).toBeInTheDocument();
    
    // El pedido sin error NO ofrece reintentar
    const repItems = screen.getAllByRole('heading', { level: 4 });
    expect(repItems.length).toBe(2);

    expect(screen.queryAllByText('El correo de confirmación no se pudo entregar').length).toBe(1);
    
    const srAlert = screen.getByText('Fallo en correo');
    expect(srAlert).toBeInTheDocument();
    
    const retryBtn = screen.getByRole('button', { name: 'Reintentar envío' });
    expect(retryBtn).toBeInTheDocument();
  });

  it('llama a la ruta correcta cuando se reintenta y avisa si falla', async () => {
    mockApi.post.mockResolvedValueOnce({ retried: 0 }); // Simula que volvió a fallar
    
    render(<OrderManager tenantId="tenant-123" />);
    const retryBtn = await screen.findByRole('button', { name: 'Reintentar envío' });
    
    fireEvent.click(retryBtn);

    expect(mockApi.post).toHaveBeenCalledWith(
      '/api/admin/tenants/tenant-123/store/retry-confirmation',
      {},
      expect.anything()
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('El reintento volvió a fallar. Revisa los registros.');
    });
  });

  it('avisa cuando el reintento resulta', async () => {
    mockApi.post.mockResolvedValueOnce({ retried: 1 });
    
    render(<OrderManager tenantId="tenant-123" />);
    const retryBtn = await screen.findByRole('button', { name: 'Reintentar envío' });
    
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Se reintentó el envío de 1 correo(s).');
    });
  });
});
