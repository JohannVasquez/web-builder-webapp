/** @jest-environment jsdom */
import '@testing-library/jest-dom';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaLibrary } from './MediaLibrary';
import { useAdminApi } from './useAdminApi';

jest.mock('./useAdminApi', () => ({ useAdminApi: jest.fn() }));
jest.mock('@/shared/lib/useAsyncData', () => ({
  useAsyncData: jest.fn((_key, _fetcher) => {
    // Para simplificar, devolvemos datos listos
    return {
      data: [
        {
          key: 'used.webp',
          url: 'test',
          mimeType: 'image/webp',
          size: 1024,
          alt: 'Alt guardado',
        },
      ],
      isLoading: false,
      error: null,
    };
  }),
  refreshAsyncData: jest.fn(),
}));

jest.mock('@/modules/FileStorage/presentation/ImageCropper', () => ({
  ImageCropper: ({
    onCropComplete,
    onSkip,
  }: {
    onCropComplete: (file: File) => void;
    onSkip: () => void;
  }) => (
    <div data-testid="cropper">
      <button onClick={onSkip}>Subir sin recortar</button>
      <button
        onClick={() =>
          onCropComplete(new File([''], 'cropped.webp', { type: 'image/webp' }))
        }
      >
        Guardar recorte
      </button>
    </div>
  ),
}));

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:test');
global.URL.revokeObjectURL = jest.fn();

describe('MediaLibrary', () => {
  it('el texto alternativo se conserva al recortar y hay aviso si esta en uso', async () => {
    const mockApi = {
      get: jest.fn().mockResolvedValue({
        pages: [{ ogImageKey: 'used.webp', sections: [] }],
      }),
      upload: jest
        .fn()
        .mockResolvedValue({
          asset: { key: 'new.webp', url: 'new', mimeType: 'image/webp', size: 500 },
        }),
      patch: jest.fn().mockResolvedValue({}),
      remove: jest.fn(),
    };
    (useAdminApi as jest.Mock).mockReturnValue(mockApi);

    global.confirm = jest.fn(() => true);

    render(<MediaLibrary tenantId="t1" />);

    // Find recrop button (it might be hidden by CSS but accessible in DOM)
    const recropBtn = screen.getByText('Recortar');
    await userEvent.click(recropBtn);

    // It should fetch pages to check usage
    await waitFor(() => {
      expect(mockApi.get).toHaveBeenCalledWith(
        '/api/admin/tenants/t1/pages',
        expect.anything(),
      );
    });

    // Check that confirm was called
    expect(global.confirm).toHaveBeenCalled();

    // Now cropper is open
    await waitFor(() => {
      expect(screen.getByTestId('cropper')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Guardar recorte'));

    await waitFor(() => {
      expect(mockApi.upload).toHaveBeenCalled();
      // It should patch the alt text
      expect(mockApi.patch).toHaveBeenCalledWith(
        '/api/admin/tenants/t1/media/new.webp',
        { alt: 'Alt guardado' },
        expect.anything(),
      );
    });
  });
});
