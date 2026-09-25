/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import { SubscriptionsList } from './SubscriptionsList';
import { useAsyncData } from '@/shared/lib/useAsyncData';

jest.mock('./useAdminApi');
jest.mock('@/shared/lib/useAsyncData');

describe('SubscriptionsList', () => {
  it('muestra el ingreso comprometido y distingue estados accesibles', () => {
    (useAsyncData as jest.Mock).mockReturnValue({
      data: {
        rows: [
          { tenantId: 't1', planName: 'Básico', priceCents: 30000, mrrCents: 30000, status: 'al_dia' },
          { tenantId: 't2', planName: 'Pro', priceCents: 50000, mrrCents: 0, status: 'atrasado' },
        ],
        totalMrrCents: 30000,
      },
      isLoading: false,
      error: null,
    });

    render(<SubscriptionsList />);

    expect(screen.getAllByText(/30\.000/).length).toBeGreaterThan(0);
    
    // Test for accessible status
    const atrasadoText = screen.getByText('Atrasado');
    expect(atrasadoText).toBeDefined();
    
    const row2 = atrasadoText.closest('tr');
    expect(row2?.textContent).toContain('t2');
  });
});
