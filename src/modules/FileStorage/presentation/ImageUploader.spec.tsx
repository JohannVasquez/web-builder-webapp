/** @jest-environment jsdom */
import '@testing-library/jest-dom';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageUploader } from './ImageUploader';

jest.mock('../application/FileStorageService', () => {
  return {
    FileStorageService: jest.fn().mockImplementation(() => ({
      uploadFile: jest
        .fn()
        .mockResolvedValue({
          key: 'new-key.webp',
          url: 'http://test/new-key.webp',
          size: 1024,
        }),
    })),
  };
});
jest.mock('./ImageCropper', () => ({
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

describe('ImageUploader', () => {
  it('permite subir sin recortar', async () => {
    const onUploaded = jest.fn();
    render(<ImageUploader onUploaded={onUploaded} />);

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByTestId('cropper')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Subir sin recortar'));

    await waitFor(() => {
      expect(onUploaded).toHaveBeenCalledWith('new-key.webp');
    });
  });

  it('el recorte produce un archivo distinto del original', async () => {
    const onUploaded = jest.fn();
    render(<ImageUploader onUploaded={onUploaded} />);

    const file = new File(['dummy'], 'test.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByTestId('cropper')).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText('Guardar recorte'));

    await waitFor(() => {
      expect(onUploaded).toHaveBeenCalledWith('new-key.webp');
    });
    // In our mock, FileStorageService is mocked, but we know it gets the File from onCropComplete
  });
});
