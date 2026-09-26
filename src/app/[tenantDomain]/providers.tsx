'use client';

import type { ReactElement, ReactNode } from 'react';
import { CartProvider } from '@/modules/Store/presentation/CartProvider';
import { LocalCartStorage } from '@/modules/Store/infrastructure/LocalCartStorage';
import { ConsentProvider } from '@/modules/Consent/presentation/ConsentProvider';
import { SiteApiBaseUrlProvider } from '@/shared/lib/useSiteApiBaseUrl';

// El adaptador se construye aquí, en el cliente: un server component no puede pasarle una
// instancia de clase a un client component. `src/app/**` es la raíz de composición, así que
// es el único lugar donde presentation y infrastructure pueden encontrarse (mismo criterio
// que `src/app/admin/providers.tsx` con la sesión).
const cartStorage = new LocalCartStorage();

export function TenantProviders({
  apiBaseUrl,
  children,
}: Readonly<{ apiBaseUrl?: string; children: ReactNode }>): ReactElement {
  // El consentimiento envuelve al carrito porque quien decide qué puede cargarse tiene que
  // estar disponible para todo lo de adentro, incluida la analítica. La base de la API va
  // por fuera de todo: el consentimiento también la usa para registrar la decisión.
  return (
    <SiteApiBaseUrlProvider baseUrl={apiBaseUrl}>
      <ConsentProvider>
        <CartProvider storage={cartStorage}>{children}</CartProvider>
      </ConsentProvider>
    </SiteApiBaseUrlProvider>
  );
}
