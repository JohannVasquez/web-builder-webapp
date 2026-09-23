'use client';

import type { ReactElement, ReactNode } from 'react';
import { toast } from 'sonner';
import { SessionProvider } from '@/modules/Auth/presentation/SessionProvider';
import { LocalSessionStorage } from '@/modules/Auth/infrastructure/LocalSessionStorage';

// El adaptador se construye aquí, en el cliente: un server component no puede pasarle una
// instancia de clase a un client component. `src/app/**` es la raíz de composición, así que
// es el único lugar donde presentation y infrastructure pueden encontrarse.
const storage = new LocalSessionStorage();

const notifyInactivityLogout = (): void => {
  toast('Cerramos tu sesión por inactividad.');
};

export function AdminProviders({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement {
  return (
    <SessionProvider storage={storage} onInactivityLogout={notifyInactivityLogout}>
      {children}
    </SessionProvider>
  );
}
