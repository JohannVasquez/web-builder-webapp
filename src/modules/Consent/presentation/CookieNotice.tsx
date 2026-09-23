'use client';

import type { ReactElement } from 'react';
import { useConsent } from './ConsentProvider';
import { CookieNoticeDialog } from './CookieNoticeDialog';

interface CookieNoticeProps {
  // Dirección de la política de cookies del cliente; nula = no hay página que enlazar.
  readonly policyHref?: string | null;
}

// Decide CUÁNDO se ve el aviso; lo que se ve vive en `CookieNoticeDialog`.
export function CookieNotice({
  policyHref = null,
}: CookieNoticeProps): ReactElement | null {
  const { shouldAsk, isOpen, close, decide, decision } = useConsent();

  if (!shouldAsk && !isOpen) {
    return null;
  }

  return (
    <CookieNoticeDialog
      // Remonta al reabrirlo, así la selección parte de lo ya elegido sin sincronizar estado.
      key={isOpen ? 'reabierto' : 'inicial'}
      current={decision?.purposes ?? []}
      policyHref={policyHref}
      // Reabierto desde el pie (y ya con decisión), se puede cerrar sin decidir de nuevo.
      canDismiss={!shouldAsk}
      onDecide={(next) => decide(next)}
      onClose={close}
    />
  );
}
