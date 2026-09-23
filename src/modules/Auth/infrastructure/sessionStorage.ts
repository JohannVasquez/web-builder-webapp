import { SessionSchema, type Session } from '../domain/Session';

const STORAGE_KEY = 'web-builder.admin-session';
const ACTIVITY_STORAGE_KEY = 'web-builder.admin-session.last-activity-at';

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

// Vive en una clave propia (no dentro del JSON de la sesión) para poder actualizarla sola,
// con cada interacción, sin reescribir ni volver a parsear la sesión completa.
export const readLastActivityAt = (): number | null => {
  try {
    const raw = globalThis.localStorage?.getItem(ACTIVITY_STORAGE_KEY);
    if (raw === null || raw === undefined) {
      return null;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const writeLastActivityAt = (timestamp: number): void => {
  try {
    globalThis.localStorage?.setItem(ACTIVITY_STORAGE_KEY, String(timestamp));
  } catch {
    // Sin marca persistida, la próxima lectura tratará la sesión como inactiva: es el
    // comportamiento seguro cuando no hay almacenamiento disponible.
  }
};

export const clearLastActivityAt = (): void => {
  try {
    globalThis.localStorage?.removeItem(ACTIVITY_STORAGE_KEY);
  } catch {
    // Nada que limpiar si el almacenamiento no está disponible.
  }
};
