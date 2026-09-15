import { SessionSchema, type Session } from '../domain/Session';

const STORAGE_KEY = 'web-builder.admin-session';

// El token es JWT Bearer (no cookie) porque panel y API pueden vivir en orígenes distintos.
// Todo acceso va en try/catch: en modo privado o SSR, localStorage puede no existir o lanzar.
export const readSession = (): Session | null => {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (raw === null || raw === undefined) {
      return null;
    }
    const parsed = SessionSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
};

export const writeSession = (session: Session): void => {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Sesión solo en memoria durante esta pestaña: preferible a romper el login.
  }
};

export const clearSession = (): void => {
  try {
    globalThis.localStorage?.removeItem(STORAGE_KEY);
  } catch {
    // Nada que limpiar si el almacenamiento no está disponible.
  }
};

export const readSessionToken = (): string | null => readSession()?.token ?? null;
