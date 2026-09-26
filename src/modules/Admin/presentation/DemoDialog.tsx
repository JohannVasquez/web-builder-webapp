'use client';

import { useEffect, useId, useRef, type ReactElement, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/shared/ui/button';

interface DemoDialogProps {
  readonly title: string;
  readonly onClose: () => void;
  readonly children: ReactNode;
}

// En el celular sube desde abajo y ocupa el ancho (el pulgar llega a los botones); en
// escritorio queda centrado. El foco entra al diálogo y Escape lo cierra.
export function DemoDialog({ title, onClose, children }: DemoDialogProps): ReactElement {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const firstField = panelRef.current?.querySelector<HTMLElement>(
      'input, select, textarea',
    );
    (firstField ?? panelRef.current)?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onClose();
          }
        }}
        className="ui-card max-h-[90dvh] w-full space-y-4 overflow-y-auto rounded-b-none p-5 outline-none sm:max-w-lg sm:rounded-b-[var(--ui-radius-lg,0.875rem)]"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={titleId} className="ui-heading text-lg">
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Cerrar"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
