/** @jest-environment jsdom */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LegalPagesManager } from './LegalPagesManager';
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

describe('LegalPagesManager', () => {
  const tenantId = 'tenant-123';
  const mockApi = {
    post: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAdminApi as jest.Mock).mockReturnValue(mockApi);
    window.confirm = jest.fn();
  });

  it('muestra el estado de cada documento', () => {
    (useAsyncData as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('legal-templates')) {
        return {
          isLoading: false,
          error: null,
          data: {
            reviewNotice: 'Aviso legal',
            legalTemplates: [
              { kind: 'privacidad', slug: 'politica-de-privacidad', title: 'Política de privacidad', description: 'Desc' },
              { kind: 'terminos', slug: 'terminos-y-condiciones', title: 'Términos', description: 'Desc' },
            ],
          },
        };
      }
      return {
        isLoading: false,
        error: null,
        data: [
          { slug: 'politica-de-privacidad', isPublished: true, sections: [] },
          { slug: 'terminos-y-condiciones', isPublished: false, sections: [] },
        ],
      };
    });

    render(<LegalPagesManager tenantId={tenantId} />);

    expect(screen.getByText('Política de privacidad')).toBeInTheDocument();
    expect(screen.getByText('Publicada')).toBeInTheDocument();

    expect(screen.getByText('Términos')).toBeInTheDocument();
    expect(screen.getByText('Borrador (sin publicar)')).toBeInTheDocument();
  });

  it('los marcadores sin rellenar se listan', () => {
    (useAsyncData as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('legal-templates')) {
        return {
          isLoading: false,
          error: null,
          data: {
            reviewNotice: 'Aviso legal',
            legalTemplates: [
              { kind: 'privacidad', slug: 'politica-de-privacidad', title: 'Política de privacidad', description: 'Desc' },
            ],
          },
        };
      }
      return {
        isLoading: false,
        error: null,
        data: [
          {
            slug: 'politica-de-privacidad',
            isPublished: false,
            sections: [
              { type: 'TextBlock', props: { content: 'Hola {{empresa}}, tu rut es {{rut}}.' } },
            ],
          },
        ],
      };
    });

    render(<LegalPagesManager tenantId={tenantId} />);

    expect(screen.getByText('Faltan datos por rellenar:')).toBeInTheDocument();
    expect(screen.getByText('empresa')).toBeInTheDocument();
    expect(screen.getByText('rut')).toBeInTheDocument();
  });

  it('regenerar pide confirmación', async () => {
    const user = userEvent.setup();
    (useAsyncData as jest.Mock).mockImplementation((key: string) => {
      if (key.includes('legal-templates')) {
        return {
          isLoading: false,
          error: null,
          data: {
            reviewNotice: 'Aviso legal',
            legalTemplates: [
              { kind: 'privacidad', slug: 'politica-de-privacidad', title: 'Política de privacidad', description: 'Desc' },
            ],
          },
        };
      }
      return {
        isLoading: false,
        error: null,
        data: [
          { id: '123', slug: 'politica-de-privacidad', isPublished: false, sections: [] },
        ],
      };
    });

    render(<LegalPagesManager tenantId={tenantId} />);

    const btn = screen.getByRole('button', { name: /Volver a generar/i });
    
    // Simulate canceling the confirmation
    (window.confirm as jest.Mock).mockReturnValue(false);
    await user.click(btn);
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('Perderás cualquier edición'));
    expect(mockApi.post).not.toHaveBeenCalled();

    // Simulate accepting the confirmation
    (window.confirm as jest.Mock).mockReturnValue(true);
    await user.click(btn);
    expect(mockApi.remove).toHaveBeenCalledWith(expect.stringContaining('/pages/123'));
    expect(mockApi.post).toHaveBeenCalledWith(expect.stringContaining('/legal-pages'), { kind: 'privacidad' }, expect.any(Object));
  });
});
