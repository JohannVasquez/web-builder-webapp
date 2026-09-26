import type { ReactElement } from 'react';
import { Button } from '@/shared/ui/button';
import { MediaLibrary } from './MediaLibrary';

interface MediaPickerDialogProps {
  readonly tenantId: string;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSelect: (key: string) => void;
}

export function MediaPickerDialog({
  tenantId,
  open,
  onOpenChange,
  onSelect,
}: MediaPickerDialogProps): ReactElement | null {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6">
      <div className="bg-background relative w-full max-w-4xl max-h-full overflow-y-auto rounded-lg border shadow-lg p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="ui-heading text-xl">Seleccionar imagen</h2>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
        <MediaLibrary
          tenantId={tenantId}
          onSelect={(key) => {
            onSelect(key);
            onOpenChange(false);
          }}
        />
      </div>
    </div>
  );
}
