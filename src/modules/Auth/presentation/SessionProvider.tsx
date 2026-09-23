'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createSessionStore } from '../application/sessionStore';
import { isInactivityExpired } from '../application/sessionExpiry';
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
  // Refresca la marca de última actividad; lo llaman los eventos de interacción real
  // del panel para sostener el cierre por inactividad (SPEC 9.1).
  readonly touchActivity: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

// No se escribe en `localStorage` en cada evento: solo una vez por ventana de este tamaño.
const ACTIVITY_WRITE_THROTTLE_MS = 30_000;
// Cada cuánto se revisa si la sesión ya venció mientras el panel está abierto. Con un plazo
// de 30 minutos, cerrar hasta medio minuto tarde no le cambia nada a nadie, y despertar la
// pestaña cada 5 segundos para siempre sí.
const INACTIVITY_POLL_MS = 30_000;

interface SessionProviderProps {
  readonly storage: SessionStorage;
  readonly children: ReactNode;
  // La composición de la pantalla (toast, redirección) queda fuera del módulo Auth:
  // aquí solo se decide *cuándo* cerrar la sesión por inactividad, no cómo avisarlo.
  readonly onInactivityLogout?: () => void;
}

const serverSnapshot = (): null => null;
const hydratedOnClient = (): boolean => true;
const hydratedOnServer = (): boolean => false;

export function SessionProvider({
  storage,
  children,
  onInactivityLogout,
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

  const touchActivity = useCallback((): void => {
    store.touch();
  }, [store]);

  const onInactivityLogoutRef = useRef(onInactivityLogout);
  useEffect(() => {
    onInactivityLogoutRef.current = onInactivityLogout;
  }, [onInactivityLogout]);

  // Refresca la marca de actividad con interacción real de la persona, con throttle
  // para no escribir en `localStorage` en cada evento.
  useEffect(() => {
    if (session === null) {
      return;
    }
    let lastWriteAt = 0;
    const touch = (): void => {
      const now = Date.now();
      if (now - lastWriteAt >= ACTIVITY_WRITE_THROTTLE_MS) {
        lastWriteAt = now;
        store.touch();
      }
    };
    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        touch();
      }
    };
    window.addEventListener('pointerdown', touch);
    window.addEventListener('keydown', touch);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.removeEventListener('pointerdown', touch);
      window.removeEventListener('keydown', touch);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [session, store]);

  // Cierra la sesión sola cuando se cumple el plazo, sin depender de que la persona
  // interactúe de nuevo. Lee `localStorage` en cada revisión, así que también recoge la
  // actividad marcada desde otra pestaña abierta con el mismo panel.
  useEffect(() => {
    if (session === null) {
      return;
    }
    const interval = setInterval(() => {
      if (isInactivityExpired(storage.readLastActivityAt(), Date.now())) {
        store.set(null);
        onInactivityLogoutRef.current?.();
      }
    }, INACTIVITY_POLL_MS);
    return () => {
      clearInterval(interval);
    };
  }, [session, store, storage]);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      isLoading: !isHydrated,
      token: session?.token ?? null,
      signIn,
      signOut,
      touchActivity,
    }),
    [session, isHydrated, signIn, signOut, touchActivity],
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
