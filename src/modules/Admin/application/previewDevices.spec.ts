import { findPreviewDevice, PREVIEW_DEVICES } from './previewDevices';

describe('previewDevices', () => {
  it('trae exactamente celular, tableta y escritorio', () => {
    expect(PREVIEW_DEVICES.map((device) => device.id)).toEqual([
      'mobile',
      'tablet',
      'desktop',
    ]);
  });

  it('celular y tableta tienen un ancho fijo; escritorio usa el ancho completo', () => {
    expect(findPreviewDevice('mobile').width).toBe(390);
    expect(findPreviewDevice('tablet').width).toBe(820);
    expect(findPreviewDevice('desktop').width).toBeNull();
  });
});
