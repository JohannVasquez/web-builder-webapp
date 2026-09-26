'use client';

import { createContext, useContext, type ReactElement, type ReactNode } from 'react';
import { getPublicApiBaseUrl } from '@/shared/config/api';

// Base de la API para las acciones que salen del navegador (contacto, newsletter, carrito,
// compra, consentimiento). Normalmente es la API pública; en una demo de prospecto el layout
// la cambia por `DEMO_ACTIONS_BASE_URL`, para que pasen por el servidor de Next y lleven el
// token de la cookie httpOnly sin que ningún script de la página pueda leerlo.
const SiteApiBaseUrlContext = createContext<string | null>(null);

export function SiteApiBaseUrlProvider({
  baseUrl,
  children,
}: Readonly<{ baseUrl: string | undefined; children: ReactNode }>): ReactElement {
  return (
    <SiteApiBaseUrlContext.Provider value={baseUrl ?? null}>
      {children}
    </SiteApiBaseUrlContext.Provider>
  );
}

// Fuera del proveedor (panel, pruebas) se comporta como siempre: la API pública.
export function useSiteApiBaseUrl(): string {
  return useContext(SiteApiBaseUrlContext) ?? getPublicApiBaseUrl();
}
