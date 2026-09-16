'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createSessionStore } from '../application/sessionStore';
import type { Session } from '../domain/Session';
import type { SessionStorage } from '../domain/SessionStorage';

export interface SessionContextValue {
  readonly session: Session | null;
  // `true` hasta que la sesión guardada se leyó en el cliente.
  readonly isLoading: boolean;
  readonly token: string | null;
  // Propiedades de función y no métodos: como se desestructuran del contexto, declararlas
  // como métodos hace que `unbound-method` marque cada uso.
  readonly signIn: (session: Session) => void;
  readonly signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionProviderProps {
  readonly storage: SessionStorage;
  readonly children: ReactNode;
}

const serverSnapshot = (): null => null;
const hydratedOnClient = (): boolean => true;
const hydratedOnServer = (): boolean => false;

export function SessionProvider({
  storage,
  children,
}: SessionProviderProps): ReactElement {
  const store = useMemo(() => createSessionStore(storage), [storage]);
  const session = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    serverSnapshot,
  );
  const isHydrated = useSyncExternalStore(
    store.subscribe,
    hydratedOnClient,
    hydratedOnServer,
  );

  const signIn = useCallback(
    (next: Session): void => {
      store.set(next);
    },
    [store],
  );

  const signOut = useCallback((): void => {
    store.set(null);
  }, [store]);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      isLoading: !isHydrated,
      token: session?.token ?? null,
      signIn,
      signOut,
    }),
    [session, isHydrated, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

// Para pantallas del panel, que sin sesión no deberían haberse montado.
export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (value === null) {
    throw new Error('useSession debe usarse dentro de un <SessionProvider>');
  }
  return value;
}

// Para componentes que pueden montarse fuera del panel (ej. `ImageUploader`);
// devuelve `null` en vez de lanzar.
export function useOptionalSession(): SessionContextValue | null {
  return useContext(SessionContext);
}
