// Los tres tamaños de la vista previa en vivo (Pantalla 4): ancho aproximado de un celular,
// de una tableta, y `null` para el ancho completo del panel (escritorio).

export type PreviewDeviceId = 'mobile' | 'tablet' | 'desktop';

export interface PreviewDevice {
  readonly id: PreviewDeviceId;
  readonly label: string;
  readonly width: number | null;
}

export const PREVIEW_DEVICES: readonly PreviewDevice[] = [
  { id: 'mobile', label: 'Celular', width: 390 },
  { id: 'tablet', label: 'Tableta', width: 820 },
  { id: 'desktop', label: 'Escritorio', width: null },
];

export const findPreviewDevice = (id: PreviewDeviceId): PreviewDevice =>
  PREVIEW_DEVICES.find((device) => device.id === id) ?? PREVIEW_DEVICES[0];
