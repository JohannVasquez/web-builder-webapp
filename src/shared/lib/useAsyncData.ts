'use client';

import { useSyncExternalStore } from 'react';

export interface AsyncState<T> {
  readonly data: T | null;
  readonly error: string | null;
  readonly isLoading: boolean;
}

interface Entry<T> {
  state: AsyncState<T>;
  readonly listeners: Set<() => void>;
  started: boolean;
}

const LOADING: AsyncState<never> = { data: null, error: null, isLoading: true };

// Caché de peticiones fuera de React. Vive aquí y no en `useState` + `useEffect` porque una
// petición ES un sistema externo: meterla en un efecto que hace setState provoca renders en
// cascada y obliga a cada pantalla a repetir el mismo andamiaje de carga/error.
const entries = new Map<string, Entry<unknown>>();

const entryFor = <T>(key: string): Entry<T> => {
  const existing = entries.get(key);
  if (existing !== undefined) {
    return existing as Entry<T>;
  }
  const created: Entry<T> = { state: LOADING, listeners: new Set(), started: false };
  entries.set(key, created);
  return created;
};

const publish = <T>(entry: Entry<T>, state: AsyncState<T>): void => {
  entry.state = state;
  for (const listener of entry.listeners) {
    listener();
  }
};

const start = <T>(key: string, load: () => Promise<T>): void => {
  const entry = entryFor<T>(key);
  if (entry.started) {
    return;
  }
  entry.started = true;
  void load().then(
    (data) => publish(entry, { data, error: null, isLoading: false }),
    (cause: unknown) =>
      publish(entry, {
        data: null,
        error: cause instanceof Error ? cause.message : 'No pudimos cargar los datos.',
        isLoading: false,
      }),
  );
};

// Vuelve a pedir los datos de esa clave; lo usan las pantallas tras crear o borrar algo.
export const refreshAsyncData = (key: string): void => {
  const entry = entries.get(key);
  if (entry === undefined) {
    return;
  }
  entry.started = false;
  publish(entry, LOADING);
};

// Como `refreshAsyncData`, pero deja a la vista lo que ya había mientras llega lo nuevo: una
// ficha que se vuelve a pedir tras un botón no parpadea ni pierde el scroll en el celular.
export const revalidateAsyncData = (key: string): void => {
  const entry = entries.get(key);
  if (entry === undefined) {
    return;
  }
  entry.started = false;
  publish(entry, { ...entry.state, isLoading: true });
};

export function useAsyncData<T>(key: string, load: () => Promise<T>): AsyncState<T> {
  const entry = entryFor<T>(key);
  start(key, load);

  return useSyncExternalStore(
    (listener) => {
      entry.listeners.add(listener);
      start(key, load);
      return () => {
        entry.listeners.delete(listener);
      };
    },
    () => entry.state,
    () => LOADING as AsyncState<T>,
  );
}
