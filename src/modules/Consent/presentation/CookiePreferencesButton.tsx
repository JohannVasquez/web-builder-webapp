'use client';

import type { ReactElement } from 'react';
import { useConsent } from './ConsentProvider';

/**
 * Sin esto la decisión sería irreversible: la norma exige que retirar el consentimiento sea
 * tan fácil como darlo. Va en el pie, que es donde la gente lo busca.
 */
export function CookiePreferencesButton(): ReactElement {
  const { open } = useConsent();

  return (
    <button
      type="button"
      onClick={open}
      className="hover:text-foreground underline-offset-2 hover:underline"
    >
      Configurar cookies
    </button>
  );
}
