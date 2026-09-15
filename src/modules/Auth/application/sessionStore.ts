import type { Session } from '../domain/Session';
import type { SessionStorage } from '../domain/SessionStorage';

/**
 * Store externo mínimo sobre el `SessionStorage`, pensado para consumirse con
 * `useSyncExternalStore`. Se usa eso en vez de `useState` + `useEffect`
 * porque la sesión vive fuera de React (`localStorage`): leerla en un efecto
 * provocaría un render en cascada en cada montaje, y leerla durante el render
 * rompería la hidratación del servidor.
 */
export interface SessionStore {
  readonly subscribe: (listener: () => void) => () => void;
  /** Cachea la lectura: `useSyncExternalStore` exige un snapshot estable. */
  readonly getSnapshot: () => Session | null;
  readonly set: (session: Session | null) => void;
}

export const createSessionStore = (storage: SessionStorage): SessionStore => {
  const listeners = new Set<() => void>();
  let snapshot: Session | null | undefined;

  return {
    subscribe: (listener: () => void): (() => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: (): Session | null => {
      if (snapshot === undefined) {
        snapshot = storage.read();
      }
      return snapshot;
    },
    set: (session: Session | null): void => {
      snapshot = session;
      if (session === null) {
        storage.clear();
      } else {
        storage.write(session);
      }
      for (const listener of listeners) {
        listener();
      }
    },
  };
};
