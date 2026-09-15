'use client';

import { Moon, Sun } from 'lucide-react';
import { useCallback, useSyncExternalStore, type ReactElement } from 'react';
import { THEME_STORAGE_KEY } from './ThemeScript';

const listeners = new Set<() => void>();

const notify = (): void => {
  for (const listener of listeners) {
    listener();
  }
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const isDarkNow = (): boolean => document.documentElement.classList.contains('dark');
const isDarkOnServer = (): boolean => false;

export function ThemeToggle(): ReactElement {
  const isDark = useSyncExternalStore(subscribe, isDarkNow, isDarkOnServer);

  const toggle = useCallback((): void => {
    const next = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
    } catch {
      // Sin almacenamiento el cambio vale solo para esta pestaña, que es mejor que fallar.
    }
    notify();
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex size-9 items-center justify-center rounded-md transition-colors"
    >
      {isDark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}
