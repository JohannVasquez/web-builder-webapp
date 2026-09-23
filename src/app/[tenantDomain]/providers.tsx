'use client';

import type { ReactElement, ReactNode } from 'react';
import { CartProvider } from '@/modules/Store/presentation/CartProvider';
import { LocalCartStorage } from '@/modules/Store/infrastructure/LocalCartStorage';

// El adaptador se construye aquí, en el cliente: un server component no puede pasarle una
// instancia de clase a un client component. `src/app/**` es la raíz de composición, así que
// es el único lugar donde presentation y infrastructure pueden encontrarse (mismo criterio
// que `src/app/admin/providers.tsx` con la sesión).
const cartStorage = new LocalCartStorage();

export function TenantProviders({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return <CartProvider storage={cartStorage}>{children}</CartProvider>;
}
