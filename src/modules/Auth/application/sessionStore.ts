import type { Session } from '../domain/Session';
import type { SessionStorage } from '../domain/SessionStorage';
import { isInactivityExpired } from './sessionExpiry';

// Store externo mínimo sobre `SessionStorage` para `useSyncExternalStore`: la sesión vive
// fuera de React, y leerla en un efecto o durante el render rompería el montaje o la hidratación.
export interface SessionStore {
  readonly subscribe: (listener: () => void) => () => void;
  // Cachea la lectura: `useSyncExternalStore` exige un snapshot estable.
  readonly getSnapshot: () => Session | null;
  readonly set: (session: Session | null) => void;
  // Refresca la marca de actividad sin tocar la sesión ni avisar a los suscriptores:
  // solo sostiene el cierre por inactividad (SPEC 9.1).
  readonly touch: () => void;
}

export const createSessionStore = (storage: SessionStorage): SessionStore => {
  const listeners = new Set<() => void>();
  let snapshot: Session | null | undefined;

  const readValidSession = (): Session | null => {
    const session = storage.read();
    if (session === null) {
      return null;
    }
    if (isInactivityExpired(storage.readLastActivityAt(), Date.now())) {
      storage.clear();
      return null;
    }
    return session;
  };

  return {
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: (): Session | null => {
      if (snapshot === undefined) {
        snapshot = readValidSession();
      }
      return snapshot;
    },
    set: (session: Session | null): void => {
      snapshot = session;
      if (session === null) {
        storage.clear();
      } else {
        storage.write(session);
        storage.writeLastActivityAt(Date.now());
      }
      for (const listener of listeners) {
        listener();
      }
    },
    touch: (): void => {
      if (snapshot !== undefined && snapshot !== null) {
        storage.writeLastActivityAt(Date.now());
      }
    },
  };
};
