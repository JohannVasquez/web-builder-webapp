import {
  CONSENT_TEXT_VERSION,
  type ConsentDecision,
  type ConsentPurpose,
  CONSENT_PURPOSES,
  TRACKER_COOKIE_PREFIXES,
} from '../domain/Consent';

const DECISION_KEY = 'web-builder.consent';
const SUBJECT_KEY = 'web-builder.consent-subject';

// Identificador del visitante. No dice quién es: solo permite reencontrar SU decisión y
// ligarla al registro que guarda la API.
export const readOrCreateSubject = (): string => {
  try {
    const existing = globalThis.localStorage?.getItem(SUBJECT_KEY);
    if (existing !== null && existing !== undefined && existing.length >= 8) {
      return existing;
    }
    const created = `visitante-${globalThis.crypto.randomUUID()}`;
    globalThis.localStorage?.setItem(SUBJECT_KEY, created);
    return created;
  } catch {
    // Sin almacenamiento la decisión vale para esta visita y no se puede reencontrar. Es
    // peor experiencia, no un fallo: preferible a no poder decidir.
    return `visitante-${globalThis.crypto.randomUUID()}`;
  }
};

const isPurpose = (value: unknown): value is ConsentPurpose =>
  typeof value === 'string' && (CONSENT_PURPOSES as readonly string[]).includes(value);

// El `localStorage` es una caché de la decisión, no su registro: el que prueba algo vive en
// la API (ver el módulo `Consent` de web-builder-api).
export const readDecision = (): ConsentDecision | null => {
  try {
    const raw = globalThis.localStorage?.getItem(DECISION_KEY);
    if (raw === null || raw === undefined) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) {
      return null;
    }
    const { purposes, textVersion } = parsed as Record<string, unknown>;
    if (!Array.isArray(purposes) || typeof textVersion !== 'string') {
      return null;
    }
    return { purposes: purposes.filter(isPurpose), textVersion };
  } catch {
    // Un valor corrupto se trata como ausencia de decisión: se vuelve a preguntar.
    return null;
  }
};

export const writeDecision = (decision: ConsentDecision): void => {
  try {
    globalThis.localStorage?.setItem(DECISION_KEY, JSON.stringify(decision));
  } catch {
    // Igual que arriba: la decisión vale para esta visita.
  }
};

/**
 * Borra las cookies de las finalidades que la persona NO aceptó. Dejar de cargar el script no
 * quita lo que ya quedó puesto, y una cookie de medición que sobrevive al rechazo es
 * exactamente lo que se estaba rechazando.
 *
 * Se intenta en el dominio actual y en el dominio padre porque los rastreadores suelen
 * ponerlas en `.dominio.cl` para que valgan en todos los subdominios.
 */
export const clearCookiesFor = (
  revoked: readonly ConsentPurpose[],
  documentRef: Document = globalThis.document,
): void => {
  const prefixes = revoked.flatMap((purpose) => TRACKER_COOKIE_PREFIXES[purpose]);
  if (prefixes.length === 0) {
    return;
  }

  const host = documentRef.location?.hostname ?? '';
  const parentDomain = host.split('.').slice(-2).join('.');
  const domains = [undefined, host, `.${parentDomain}`];

  for (const cookie of documentRef.cookie.split(';')) {
    const name = cookie.split('=')[0]?.trim() ?? '';
    if (name === '' || !prefixes.some((prefix) => name.startsWith(prefix))) {
      continue;
    }
    for (const domain of domains) {
      const domainPart = domain === undefined ? '' : `; domain=${domain}`;
      documentRef.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${domainPart}`;
    }
  }
};

export const isCurrentVersion = (decision: ConsentDecision | null): boolean =>
  decision !== null && decision.textVersion === CONSENT_TEXT_VERSION;

/**
 * La decisión como fuente externa para `useSyncExternalStore`. Se hace así y no con un efecto
 * porque leer `localStorage` en un efecto obliga a un `setState` que dispara un render en
 * cascada en cada carga; esta es la forma que React ofrece para un dato que vive fuera de él.
 */
const listeners = new Set<() => void>();

let cached: ConsentDecision | null = null;
let cacheLoaded = false;

// `useSyncExternalStore` compara por identidad: devolver un objeto nuevo en cada lectura
// dejaría a React re-renderizando sin parar.
export const getDecisionSnapshot = (): ConsentDecision | null => {
  if (!cacheLoaded) {
    cached = readDecision();
    cacheLoaded = true;
  }
  return cached;
};

// En el servidor no hay decisión que leer.
export const getServerDecisionSnapshot = (): ConsentDecision | null => null;

export const subscribeToDecision = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const publishDecision = (decision: ConsentDecision): void => {
  cached = decision;
  cacheLoaded = true;
  writeDecision(decision);
  for (const listener of listeners) {
    listener();
  }
};

// Solo para las pruebas: la caché de módulo sobrevive entre casos.
export const resetDecisionCache = (): void => {
  cached = null;
  cacheLoaded = false;
};
