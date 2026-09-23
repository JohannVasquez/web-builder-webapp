'use client';

import { useEffect, useRef, useState, type ReactElement } from 'react';
import {
  acceptAll,
  decisionFor,
  OPTIONAL_PURPOSES,
  PURPOSE_DESCRIPTIONS,
  PURPOSE_LABELS,
  rejectAll,
  type ConsentDecision,
  type ConsentPurpose,
} from '../domain/Consent';
import { Button } from '@/shared/ui/button';

interface CookieNoticeDialogProps {
  // Lo ya elegido, para reponerlo al reabrir el aviso desde el pie.
  readonly current: readonly ConsentPurpose[];
  // Dirección de la política de cookies del cliente; nula = no hay página que enlazar.
  readonly policyHref: string | null;
  // Falso mientras no exista decisión: ahí el aviso no se puede cerrar sin decidir.
  readonly canDismiss: boolean;
  readonly onDecide: (decision: ConsentDecision) => void;
  readonly onClose: () => void;
}

/**
 * El aviso en sí, sin contexto: recibe lo que muestra y avisa lo que se eligió. Separarlo de
 * `CookieNotice` lo hace comprobable, que en un control legal importa más que en otro sitio.
 */
export function CookieNoticeDialog({
  current,
  policyHref,
  canDismiss,
  onDecide,
  onClose,
}: CookieNoticeDialogProps): ReactElement {
  const [showDetail, setShowDetail] = useState(false);
  const [selected, setSelected] = useState<readonly ConsentPurpose[]>(current);
  const dialogRef = useRef<HTMLDivElement>(null);

  // El foco entra al aviso: quien navega con teclado no tiene que tabular el sitio entero
  // para llegar a la decisión que le está tapando la pantalla.
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const toggle = (purpose: ConsentPurpose): void => {
    setSelected((currentSelection) =>
      currentSelection.includes(purpose)
        ? currentSelection.filter((item) => item !== purpose)
        : [...currentSelection, purpose],
    );
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-labelledby="aviso-cookies-titulo"
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && canDismiss) {
          onClose();
        }
      }}
      className="ui-card fixed inset-x-4 bottom-4 z-50 flex max-h-[80dvh] flex-col gap-4 overflow-y-auto p-5 shadow-lg sm:left-auto sm:max-w-lg"
    >
      <div className="flex flex-col gap-2">
        <h2 id="aviso-cookies-titulo" className="text-base font-semibold">
          Cookies en este sitio
        </h2>
        <p className="text-muted-foreground text-sm">
          Usamos cookies necesarias para que el sitio funcione. Las de medición y
          publicidad solo se activan si tú lo autorizas, y puedes cambiar de opinión
          cuando quieras.
          {policyHref !== null && (
            <>
              {' '}
              <a href={policyHref} className="text-primary underline underline-offset-2">
                Ver la política de cookies
              </a>
              .
            </>
          )}
        </p>
      </div>

      {showDetail && (
        <fieldset className="flex flex-col gap-3 border-t pt-3">
          <legend className="sr-only">Finalidades</legend>
          <label className="flex items-start gap-3 text-sm opacity-70">
            <input type="checkbox" checked disabled className="mt-1" />
            <span>
              <span className="font-medium">{PURPOSE_LABELS.necessary}</span>
              <span className="text-muted-foreground block text-xs">
                {PURPOSE_DESCRIPTIONS.necessary}
              </span>
            </span>
          </label>
          {OPTIONAL_PURPOSES.map((purpose) => (
            <label key={purpose} className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={selected.includes(purpose)}
                onChange={() => toggle(purpose)}
              />
              <span>
                <span className="font-medium">{PURPOSE_LABELS[purpose]}</span>
                <span className="text-muted-foreground block text-xs">
                  {PURPOSE_DESCRIPTIONS[purpose]}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      )}

      <div className="flex flex-wrap gap-2">
        {/* Rechazar pesa lo mismo que aceptar. Un botón apagado al lado de uno llamativo es
            justo el patrón que la norma trata como consentimiento viciado. */}
        <Button size="sm" onClick={() => onDecide(acceptAll())}>
          Aceptar todo
        </Button>
        <Button size="sm" onClick={() => onDecide(rejectAll())}>
          Rechazar todo
        </Button>
        {showDetail ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDecide(decisionFor(selected))}
          >
            Guardar mi elección
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setShowDetail(true)}>
            Elegir finalidades
          </Button>
        )}
        {canDismiss && (
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        )}
      </div>
    </div>
  );
}
