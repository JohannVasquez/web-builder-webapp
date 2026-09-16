'use client';

import { useEffect } from 'react';

// Avisa antes de cerrar o recargar la pestaña con cambios sin guardar. La navegación dentro
// del panel la cubre cada pantalla con su propio `confirm`, porque el router de Next no
// expone un punto donde interceptarla.
export const useUnsavedChangesGuard = (hasUnsavedChanges: boolean): void => {
  useEffect(() => {
    if (!hasUnsavedChanges) {
      return;
    }
    const warn = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => {
      window.removeEventListener('beforeunload', warn);
    };
  }, [hasUnsavedChanges]);
};
