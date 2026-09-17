'use client';

import { useState, type ReactElement } from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import {
  PREVIEW_DEVICES,
  findPreviewDevice,
  type PreviewDeviceId,
} from '../application/previewDevices';
import { Button } from '@/shared/ui/button';

const DEVICE_ICONS: Readonly<Record<string, ReactElement>> = {
  mobile: <Smartphone className="size-4" />,
  tablet: <Tablet className="size-4" />,
  desktop: <Monitor className="size-4" />,
};

export interface PagePreviewProps {
  readonly primaryDomain: string | null;
  readonly previewPath: string;
}

// Vista previa en vivo (Pantalla 4): un `<iframe>` al sitio del cliente. El sitio público
// sirve lo publicado, no el borrador que se está editando aquí, así que la pantalla lo dice
// en vez de dejar creer que esto refleja los cambios sin publicar.
export function PagePreview({
  primaryDomain,
  previewPath,
}: PagePreviewProps): ReactElement {
  const [deviceId, setDeviceId] = useState<PreviewDeviceId>('mobile');
  const device = findPreviewDevice(deviceId);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          Esta vista previa muestra el sitio <strong>publicado</strong>: si tienes cambios
          sin publicar en este borrador, todavía no van a verse aquí.
        </p>
        <div className="flex gap-1">
          {PREVIEW_DEVICES.map((option) => (
            <Button
              key={option.id}
              type="button"
              size="sm"
              variant={deviceId === option.id ? 'default' : 'outline'}
              onClick={() => setDeviceId(option.id)}
            >
              {DEVICE_ICONS[option.id]} {option.label}
            </Button>
          ))}
        </div>
      </div>

      {primaryDomain === null ? (
        <p className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm">
          Este cliente todavía no tiene un dominio propio, así que no hay un sitio
          publicado que mostrar aquí.
        </p>
      ) : (
        <div className="bg-muted/30 flex justify-center overflow-x-auto rounded-md border p-3">
          <iframe
            src={`http://${primaryDomain}${previewPath}`}
            title="Vista previa del sitio publicado"
            className="h-[70vh] max-w-full rounded-md border bg-white"
            style={{ width: device.width ?? '100%' }}
          />
        </div>
      )}
    </div>
  );
}
